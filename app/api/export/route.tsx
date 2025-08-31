import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import JSZip from "jszip"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { assetIds, format, includeMetadata, quality, exportFormat, gameEngine } = await request.json()

    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json({ error: "Asset IDs are required" }, { status: 400 })
    }

    // Get assets from database with asset type information
    const { data: assets, error: assetsError } = await supabase
      .from("generated_assets")
      .select(`
        *,
        asset_projects(name),
        asset_types(name, display_name, export_formats)
      `)
      .in("id", assetIds)
      .eq("user_id", user.id)

    if (assetsError || !assets) {
      return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 })
    }

    if (format === "single" && assets.length === 1) {
      const asset = assets[0]
      return await exportSingleAsset(asset, exportFormat, gameEngine)
    }

    return await exportAssetPack(assets, exportFormat, gameEngine, includeMetadata)
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}

async function exportSingleAsset(asset: any, exportFormat: string, gameEngine: string) {
  const imageResponse = await fetch(asset.image_url)
  const imageBuffer = await imageResponse.arrayBuffer()

  switch (exportFormat) {
    case "png":
      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="${sanitizeFilename(asset.prompt)}.png"`,
        },
      })

    case "aseprite":
      return await exportAseprite(asset, imageBuffer)

    case "unity_sprite":
      return await exportUnitySprite(asset, imageBuffer)

    case "godot_texture":
      return await exportGodotTexture(asset, imageBuffer)

    case "tiled_tileset":
      return await exportTiledTileset(asset, imageBuffer)

    default:
      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="${sanitizeFilename(asset.prompt)}.png"`,
        },
      })
  }
}

async function exportAssetPack(assets: any[], exportFormat: string, gameEngine: string, includeMetadata: boolean) {
  const zip = new JSZip()

  // Create organized folder structure based on game engine
  const folders = createGameEngineFolders(zip, gameEngine)

  for (const asset of assets) {
    try {
      const imageResponse = await fetch(asset.image_url)
      const imageBuffer = await imageResponse.arrayBuffer()

      await addAssetToZip(zip, folders, asset, imageBuffer, exportFormat, gameEngine, includeMetadata)
    } catch (error) {
      console.error(`Failed to process asset ${asset.id}:`, error)
    }
  }

  // Add project configuration files
  await addProjectFiles(zip, folders, assets, gameEngine)

  const zipBuffer = await zip.generateAsync({ type: "arraybuffer" })
  const filename = `${gameEngine}_asset_pack_${Date.now()}.zip`

  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}

function createGameEngineFolders(zip: JSZip, gameEngine: string) {
  switch (gameEngine) {
    case "unity":
      return {
        sprites: zip.folder("Assets/Sprites"),
        materials: zip.folder("Assets/Materials"),
        prefabs: zip.folder("Assets/Prefabs"),
        tilemaps: zip.folder("Assets/Tilemaps"),
      }
    case "godot":
      return {
        textures: zip.folder("textures"),
        scenes: zip.folder("scenes"),
        resources: zip.folder("resources"),
        tilemaps: zip.folder("tilemaps"),
      }
    case "phaser":
      return {
        assets: zip.folder("assets"),
        sprites: zip.folder("assets/sprites"),
        tilemaps: zip.folder("assets/tilemaps"),
        audio: zip.folder("assets/audio"),
      }
    case "tiled":
      return {
        tilesets: zip.folder("tilesets"),
        maps: zip.folder("maps"),
        objects: zip.folder("objects"),
      }
    default:
      return {
        assets: zip.folder("assets"),
        metadata: zip.folder("metadata"),
      }
  }
}

async function addAssetToZip(
  zip: JSZip,
  folders: any,
  asset: any,
  imageBuffer: ArrayBuffer,
  exportFormat: string,
  gameEngine: string,
  includeMetadata: boolean,
) {
  const assetType = asset.asset_types?.name || "props"
  const filename = sanitizeFilename(asset.prompt)

  switch (gameEngine) {
    case "unity":
      await addUnityAsset(folders, asset, imageBuffer, filename, assetType)
      break
    case "godot":
      await addGodotAsset(folders, asset, imageBuffer, filename, assetType)
      break
    case "phaser":
      await addPhaserAsset(folders, asset, imageBuffer, filename, assetType)
      break
    case "tiled":
      await addTiledAsset(folders, asset, imageBuffer, filename, assetType)
      break
    default:
      folders.assets?.file(`${filename}.png`, imageBuffer)
  }

  if (includeMetadata) {
    const metadata = generateAssetMetadata(asset, gameEngine)
    folders.metadata?.file(`${filename}.json`, JSON.stringify(metadata, null, 2))
  }
}

async function addUnityAsset(folders: any, asset: any, imageBuffer: ArrayBuffer, filename: string, assetType: string) {
  // Add sprite image
  folders.sprites?.file(`${filename}.png`, imageBuffer)

  // Generate Unity .meta file
  const metaContent = generateUnityMeta(asset, assetType)
  folders.sprites?.file(`${filename}.png.meta`, metaContent)

  if (assetType === "tileset") {
    // Generate Unity Tilemap asset
    const tilemapAsset = generateUnityTilemap(asset, filename)
    folders.tilemaps?.file(`${filename}_tilemap.asset`, tilemapAsset)
  }

  if (assetType === "fx") {
    // Generate Unity Animation Controller
    const animController = generateUnityAnimController(asset, filename)
    folders.prefabs?.file(`${filename}_anim.controller`, animController)
  }
}

async function addGodotAsset(folders: any, asset: any, imageBuffer: ArrayBuffer, filename: string, assetType: string) {
  // Add texture
  folders.textures?.file(`${filename}.png`, imageBuffer)

  // Generate Godot .import file
  const importContent = generateGodotImport(asset, assetType)
  folders.textures?.file(`${filename}.png.import`, importContent)

  if (assetType === "tileset") {
    // Generate Godot TileSet resource
    const tilesetResource = generateGodotTileSet(asset, filename)
    folders.resources?.file(`${filename}_tileset.tres`, tilesetResource)
  }

  if (assetType === "parallax") {
    // Generate Godot ParallaxBackground scene
    const parallaxScene = generateGodotParallaxScene(asset, filename)
    folders.scenes?.file(`${filename}_parallax.tscn`, parallaxScene)
  }
}

async function addPhaserAsset(folders: any, asset: any, imageBuffer: ArrayBuffer, filename: string, assetType: string) {
  folders.sprites?.file(`${filename}.png`, imageBuffer)

  if (assetType === "fx" && asset.parameters?.sprite_sheet) {
    // Generate Phaser sprite sheet JSON
    const spriteSheetData = generatePhaserSpriteSheet(asset, filename)
    folders.sprites?.file(`${filename}.json`, JSON.stringify(spriteSheetData, null, 2))
  }

  if (assetType === "tileset") {
    // Generate Phaser tilemap JSON
    const tilemapData = generatePhaserTilemap(asset, filename)
    folders.tilemaps?.file(`${filename}_tilemap.json`, JSON.stringify(tilemapData, null, 2))
  }
}

async function addTiledAsset(folders: any, asset: any, imageBuffer: ArrayBuffer, filename: string, assetType: string) {
  if (assetType === "tileset") {
    folders.tilesets?.file(`${filename}.png`, imageBuffer)

    // Generate Tiled .tsx file
    const tsxContent = generateTiledTSX(asset, filename)
    folders.tilesets?.file(`${filename}.tsx`, tsxContent)

    // Generate sample .tmx map
    const tmxContent = generateTiledTMX(asset, filename)
    folders.maps?.file(`${filename}_sample.tmx`, tmxContent)
  } else {
    folders.objects?.file(`${filename}.png`, imageBuffer)
  }
}

async function addProjectFiles(zip: JSZip, folders: any, assets: any[], gameEngine: string) {
  switch (gameEngine) {
    case "unity":
      // Add Unity project files
      const unityManifest = generateUnityPackageManifest(assets)
      zip.file("package.json", JSON.stringify(unityManifest, null, 2))
      break

    case "godot":
      // Add Godot project file
      const godotProject = generateGodotProject(assets)
      zip.file("project.godot", godotProject)
      break

    case "phaser":
      // Add Phaser preload script
      const phaserPreload = generatePhaserPreload(assets)
      folders.assets?.file("preload.js", phaserPreload)
      break
  }
}

// Format-specific generators
function generateUnityMeta(asset: any, assetType: string): string {
  const guid = generateGUID()
  const textureType = assetType === "tileset" ? "2" : "8" // Sprite vs Default

  return `fileFormatVersion: 2
guid: ${guid}
TextureImporter:
  internalIDToNameTable: []
  externalObjects: {}
  serializedVersion: 12
  mipmaps:
    mipMapMode: 0
    enableMipMap: 0
    sRGBTexture: 1
    linearTexture: 0
    fadeOut: 0
    borderMipMap: 0
    mipMapsPreserveCoverage: 0
    alphaTestReferenceValue: 0.5
    mipMapFadeDistanceStart: 1
    mipMapFadeDistanceEnd: 3
  bumpmap:
    convertToNormalMap: 0
    externalNormalMap: 0
    heightScale: 0.25
    normalMapFilter: 0
  isReadable: 0
  streamingMipmaps: 0
  streamingMipmapsPriority: 0
  vTOnly: 0
  ignoreMasterTextureLimit: 0
  grayScaleToAlpha: 0
  generateCubemap: 6
  cubemapConvolution: 0
  seamlessCubemap: 0
  textureFormat: 1
  maxTextureSize: 2048
  textureSettings:
    serializedVersion: 2
    filterMode: 0
    aniso: 1
    mipBias: 0
    wrapU: 1
    wrapV: 1
    wrapW: 1
  nPOTScale: 0
  lightmap: 0
  compressionQuality: 50
  spriteMode: ${textureType}
  spriteExtrude: 1
  spriteMeshType: 1
  alignment: 0
  spritePivot: {x: 0.5, y: 0.5}
  spritePixelsPerUnit: ${asset.parameters?.tile_size === "32x32" ? "32" : "100"}
  spriteBorder: {x: 0, y: 0, z: 0, w: 0}
  spriteGenerateFallbackPhysicsShape: 1
  alphaUsage: 1
  alphaIsTransparency: 1
  spriteTessellationDetail: -1
  textureType: ${textureType}
  textureShape: 1
  singleChannelComponent: 0
  flipbookRows: 1
  flipbookColumns: 1
  maxTextureSizeSet: 0
  compressionQualitySet: 0
  textureFormatSet: 0
  ignorePngGamma: 0
  applyGammaDecoding: 0
  platformSettings:
  - serializedVersion: 3
    buildTarget: DefaultTexturePlatform
    maxTextureSize: 2048
    resizeAlgorithm: 0
    textureFormat: -1
    textureCompression: 1
    compressionQuality: 50
    crunchedCompression: 0
    allowsAlphaSplitting: 0
    overridden: 0
    androidETC2FallbackOverride: 0
    forceMaximumCompressionQuality_BC6H_BC7: 0
  spriteSheet:
    serializedVersion: 2
    sprites: []
    outline: []
    physicsShape: []
    bones: []
    spriteID: 
    internalID: 0
    vertices: []
    indices: 
    edges: []
    weights: []
    secondaryTextures: []
    nameFileIdTable: {}
  spritePackingTag: 
  pSDRemoveMatte: 0
  pSDShowRemoveMatteOption: 0
  userData: 
  assetBundleName: 
  assetBundleVariant: `
}

function generateGodotImport(asset: any, assetType: string): string {
  return `[remap]

importer="texture"
type="CompressedTexture2D"
uid="uid://b${Math.random().toString(36).substr(2, 9)}"
path="res://.godot/imported/${sanitizeFilename(asset.prompt)}.png-${generateGUID().replace(/-/g, "")}.ctex"
metadata={
"vram_texture": false
}

[deps]

source_file="res://textures/${sanitizeFilename(asset.prompt)}.png"
dest_files=["res://.godot/imported/${sanitizeFilename(asset.prompt)}.png-${generateGUID().replace(/-/g, "")}.ctex"]

[params]

compress/mode=0
compress/high_quality=false
compress/lossy_quality=0.7
compress/hdr_compression=1
compress/normal_map=0
compress/channel_pack=0
mipmaps/generate=false
mipmaps/limit=-1
roughness/mode=0
roughness/src_normal=""
process/fix_alpha_border=true
process/premult_alpha=false
process/normal_map_invert_y=false
process/hdr_as_srgb=false
process/hdr_clamp_exposure=false
process/size_limit=0
detect_3d/compress_to=1`
}

function generateTiledTSX(asset: any, filename: string): string {
  const tileSize = asset.parameters?.tile_size || "32x32"
  const [width, height] = tileSize.split("x").map(Number)
  const gridSize = asset.parameters?.grid_size || "8x8"
  const [cols, rows] = gridSize.split("x").map(Number)

  return `<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.10" tiledversion="1.10.2" name="${filename}" tilewidth="${width}" tileheight="${height}" tilecount="${cols * rows}" columns="${cols}">
 <image source="${filename}.png" width="${cols * width}" height="${rows * height}"/>
 ${asset.parameters?.collision_data ? generateTileCollisions(cols * rows) : ""}
</tileset>`
}

function generateTileCollisions(tileCount: number): string {
  let collisions = ""
  for (let i = 0; i < tileCount; i++) {
    // Generate basic collision shapes for demonstration
    collisions += `
 <tile id="${i}">
  <objectgroup draworder="index" id="1">
   <object id="1" x="0" y="0" width="32" height="32"/>
  </objectgroup>
 </tile>`
  }
  return collisions
}

function generateAssetMetadata(asset: any, gameEngine: string) {
  return {
    id: asset.id,
    prompt: asset.prompt,
    project: asset.asset_projects?.name || "No project",
    asset_type: asset.asset_types?.name || "props",
    parameters: asset.parameters,
    export_data: asset.export_data,
    game_engine: gameEngine,
    created_at: asset.created_at,
    status: asset.status,
    export_timestamp: new Date().toISOString(),
    compatibility: {
      unity: asset.asset_types?.export_formats?.includes("unity_sprite") || false,
      godot: asset.asset_types?.export_formats?.includes("godot_texture") || false,
      phaser: asset.asset_types?.export_formats?.includes("png") || false,
      tiled: asset.asset_types?.export_formats?.includes("tmx") || false,
    },
  }
}

// Utility functions
function generateGUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function generateUnityPackageManifest(assets: any[]) {
  return {
    name: "tessera-asset-pack",
    displayName: "Tessera Asset Pack",
    version: "1.0.0",
    description: "AI-generated game assets from Tessera",
    unity: "2021.3",
    keywords: ["assets", "ai", "tessera", "sprites", "tiles"],
    category: "2D",
    dependencies: {},
  }
}

function generateGodotProject(assets: any[]) {
  return `; Engine configuration file.
; It's best edited using the editor UI and not directly,
; since the parameters that go here are not all obvious.
;
; Format:
;   [section] ; section goes between []
;   param=value ; assign values to parameters

config_version=5

[application]

config/name="Tessera Asset Pack"
config/description="AI-generated game assets from Tessera"
config/version="1.0.0"

[rendering]

textures/canvas_textures/default_texture_filter=0`
}

function generatePhaserPreload(assets: any[]) {
  let preloadCode = `// Auto-generated Phaser preload script for Tessera assets
class AssetPreloader {
  static preload(scene) {
    // Load all generated assets
`

  assets.forEach((asset) => {
    const filename = sanitizeFilename(asset.prompt)
    const assetType = asset.asset_types?.name || "props"

    if (assetType === "fx" && asset.parameters?.sprite_sheet) {
      preloadCode += `    scene.load.atlas('${filename}', 'assets/sprites/${filename}.png', 'assets/sprites/${filename}.json');\n`
    } else if (assetType === "tileset") {
      preloadCode += `    scene.load.image('${filename}_tiles', 'assets/sprites/${filename}.png');\n`
      preloadCode += `    scene.load.tilemapTiledJSON('${filename}_map', 'assets/tilemaps/${filename}_tilemap.json');\n`
    } else {
      preloadCode += `    scene.load.image('${filename}', 'assets/sprites/${filename}.png');\n`
    }
  })

  preloadCode += `  }
}

export default AssetPreloader;`

  return preloadCode
}

// Placeholder generators for complex formats
function generateUnityTilemap(asset: any, filename: string): string {
  return `%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!114 &11400000
MonoBehaviour:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_GameObject: {fileID: 0}
  m_Enabled: 1
  m_EditorHideFlags: 0
  m_Script: {fileID: 13312, guid: 0000000000000000e000000000000000, type: 0}
  m_Name: ${filename}_tilemap
  m_EditorClassIdentifier: 
  m_Sprite: {fileID: 0}
  m_Color: {r: 1, g: 1, b: 1, a: 1}
  m_Transform:
    e00: 1
    e01: 0
    e02: 0
    e03: 0
    e10: 0
    e11: 1
    e12: 0
    e13: 0
    e20: 0
    e21: 0
    e22: 1
    e23: 0
    e30: 0
    e31: 0
    e32: 0
    e33: 1`
}

function generateGodotTileSet(asset: any, filename: string): string {
  return `[gd_resource type="TileSet" format=3]

[resource]
tile_size = Vector2i(32, 32)
physics_layer_0/collision_layer = 1
sources/0 = SubResource("TileSetAtlasSource_1")

[sub_resource type="TileSetAtlasSource" id="TileSetAtlasSource_1"]
texture = preload("res://textures/${filename}.png")
texture_region_size = Vector2i(32, 32)`
}

function generatePhaserSpriteSheet(asset: any, filename: string) {
  const frameCount = asset.parameters?.frame_count || 8
  const frameWidth = 64
  const frameHeight = 64

  return {
    frames: Array.from({ length: frameCount }, (_, i) => ({
      filename: `${filename}_${i.toString().padStart(2, "0")}`,
      frame: { x: i * frameWidth, y: 0, w: frameWidth, h: frameHeight },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: frameWidth, h: frameHeight },
      sourceSize: { w: frameWidth, h: frameHeight },
    })),
    meta: {
      app: "Tessera",
      version: "1.0",
      image: `${filename}.png`,
      format: "RGBA8888",
      size: { w: frameCount * frameWidth, h: frameHeight },
      scale: "1",
    },
  }
}

function generatePhaserTilemap(asset: any, filename: string) {
  return {
    compressionlevel: -1,
    height: 10,
    infinite: false,
    layers: [
      {
        data: Array(100).fill(1),
        height: 10,
        id: 1,
        name: "Tile Layer 1",
        opacity: 1,
        type: "tilelayer",
        visible: true,
        width: 10,
        x: 0,
        y: 0,
      },
    ],
    nextlayerid: 2,
    nextobjectid: 1,
    orientation: "orthogonal",
    renderorder: "right-down",
    tiledversion: "1.10.2",
    tileheight: 32,
    tilesets: [
      {
        firstgid: 1,
        source: `${filename}.tsx`,
      },
    ],
    tilewidth: 32,
    type: "map",
    version: "1.10",
    width: 10,
  }
}

function generateTiledTMX(asset: any, filename: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.10" tiledversion="1.10.2" orientation="orthogonal" renderorder="right-down" width="10" height="10" tilewidth="32" tileheight="32" infinite="0" nextlayerid="2" nextobjectid="1">
 <tileset firstgid="1" source="${filename}.tsx"/>
 <layer id="1" name="Tile Layer 1" width="10" height="10">
  <data encoding="csv">
1,1,1,1,1,1,1,1,1,1,
1,1,1,1,1,1,1,1,1,1,
1,1,1,1,1,1,1,1,1,1,
1,1,1,1,1,1,1,1,1,1,
1,1,1,1,1,1,1,1,1,1,
1,1,1,1,1,1,1,1,1,1,
1,1,1,1,1,1,1,1,1,1,
1,1,1,1,1,1,1,1,1,1,
1,1,1,1,1,1,1,1,1,1,
1,1,1,1,1,1,1,1,1,1
</data>
 </layer>
</map>`
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 50)
}

// Placeholder implementations for missing export functions
async function exportAseprite(asset: any, imageBuffer: ArrayBuffer) {
  // For now, return PNG with JSON metadata
  const zip = new JSZip()
  zip.file(`${sanitizeFilename(asset.prompt)}.png`, imageBuffer)

  const asepriteData = {
    frames: asset.parameters?.frame_count || 1,
    width: 64,
    height: 64,
    tags: asset.parameters?.loop ? [{ name: "loop", from: 0, to: (asset.parameters?.frame_count || 1) - 1 }] : [],
  }

  zip.file(`${sanitizeFilename(asset.prompt)}.json`, JSON.stringify(asepriteData, null, 2))

  const zipBuffer = await zip.generateAsync({ type: "arraybuffer" })
  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${sanitizeFilename(asset.prompt)}_aseprite.zip"`,
    },
  })
}

async function exportUnitySprite(asset: any, imageBuffer: ArrayBuffer) {
  const zip = new JSZip()
  zip.file(`${sanitizeFilename(asset.prompt)}.png`, imageBuffer)

  const metaContent = generateUnityMeta(asset, asset.asset_types?.name || "props")
  zip.file(`${sanitizeFilename(asset.prompt)}.png.meta`, metaContent)

  const zipBuffer = await zip.generateAsync({ type: "arraybuffer" })
  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${sanitizeFilename(asset.prompt)}_unity.zip"`,
    },
  })
}

async function exportGodotTexture(asset: any, imageBuffer: ArrayBuffer) {
  const zip = new JSZip()
  zip.file(`${sanitizeFilename(asset.prompt)}.png`, imageBuffer)

  const importContent = generateGodotImport(asset, asset.asset_types?.name || "props")
  zip.file(`${sanitizeFilename(asset.prompt)}.png.import`, importContent)

  const zipBuffer = await zip.generateAsync({ type: "arraybuffer" })
  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${sanitizeFilename(asset.prompt)}_godot.zip"`,
    },
  })
}

async function exportTiledTileset(asset: any, imageBuffer: ArrayBuffer) {
  const zip = new JSZip()
  const filename = sanitizeFilename(asset.prompt)

  zip.file(`${filename}.png`, imageBuffer)

  const tsxContent = generateTiledTSX(asset, filename)
  zip.file(`${filename}.tsx`, tsxContent)

  const tmxContent = generateTiledTMX(asset, filename)
  zip.file(`${filename}_sample.tmx`, tmxContent)

  const zipBuffer = await zip.generateAsync({ type: "arraybuffer" })
  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}_tiled.zip"`,
    },
  })
}

function generateUnityAnimController(asset: any, filename: string): string {
  return `%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!91 &9100000
AnimatorController:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_GameObject: {fileID: 0}
  m_Enabled: 1
  m_Avatar: {fileID: 0}
  m_Controller: {fileID: 9100000}
  m_AnimatorLayers:
  - serializedVersion: 5
    m_Name: Base Layer
    m_StateMachine: {fileID: 1107000000}
    m_Mask: {fileID: 0}
    m_Motions: []
    m_Behaviours: []
    m_BlendingMode: 0
    m_SyncedLayerIndex: -1
    m_DefaultWeight: 0
    m_IKPass: 0
    m_SyncedLayerAffectsTiming: 0
    m_Controller: {fileID: 9100000}`
}

function generateGodotParallaxScene(asset: any, filename: string): string {
  const layers = asset.parameters?.layers || 3
  let sceneContent = `[gd_scene load_steps=2 format=3]

[ext_resource type="Texture2D" uid="uid://b${Math.random().toString(36).substr(2, 9)}" path="res://textures/${filename}.png" id="1"]

[node name="ParallaxBackground" type="ParallaxBackground"]
`

  for (let i = 0; i < layers; i++) {
    const depth = (i + 1) / layers
    sceneContent += `
[node name="ParallaxLayer${i + 1}" type="ParallaxLayer" parent="."]
motion_scale = Vector2(${depth}, 1)

[node name="Sprite2D" type="Sprite2D" parent="ParallaxLayer${i + 1}"]
texture = ExtResource("1")
`
  }

  return sceneContent
}
