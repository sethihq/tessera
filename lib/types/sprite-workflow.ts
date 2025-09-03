// Advanced Sprite Sheet Workflow Types

export interface SpriteWorkflowStage {
  stage_number: number
  label: 'Setup' | 'Build-up' | 'Climax' | 'Release' | 'Aftermath'
  description: string
}

export interface SpriteWorkflowFrame {
  frame_number: number
  stage: number
  description: string
  status?: 'idle' | 'generating' | 'completed' | 'error'
  image_url?: string
  prompt?: string
  generation_settings?: {
    seed?: number
    guidance_scale?: number
    num_inference_steps?: number
  }
}

export interface SpriteWorkflowCanvas {
  size: string // e.g., "64x64 pixels"
  background: 'transparent' | 'white' | 'black' | string
  consistency: string
}

export interface SpriteWorkflowCharacter {
  identity: string
  base_pose: string
  style_reference?: string
}

export interface SpriteWorkflowAnimation {
  title: string
  stages: SpriteWorkflowStage[]
  duration_ms?: number
  loop?: boolean
}

export interface SpriteWorkflow {
  id: string
  name: string
  created_at: string
  updated_at: string
  user_id: string
  project_id?: string
  
  sprite_sheet: {
    style: string
    canvas: SpriteWorkflowCanvas
    character: SpriteWorkflowCharacter
    animation: SpriteWorkflowAnimation
    frames: SpriteWorkflowFrame[]
  }
  
  // Generation settings
  settings: {
    model: 'gemini' | 'dalle' | 'midjourney'
    quality: 'draft' | 'standard' | 'high'
    batch_size: number
    auto_generate: boolean
  }
  
  // Export settings
  export: {
    format: 'png_sequence' | 'sprite_sheet' | 'gif' | 'unity_package'
    resolution: string
    frame_rate?: number
  }
  
  // Workflow status
  status: 'draft' | 'generating' | 'completed' | 'error'
  progress: {
    completed_frames: number
    total_frames: number
    current_stage?: string
    estimated_completion?: string
  }
}

// Default workflow templates
export const DEFAULT_ANIMATION_STAGES: SpriteWorkflowStage[] = [
  {
    stage_number: 1,
    label: 'Setup',
    description: 'Character preparing the action'
  },
  {
    stage_number: 2,
    label: 'Build-up',
    description: 'Energy gathering or transformation'
  },
  {
    stage_number: 3,
    label: 'Climax',
    description: 'The peak of the animation'
  },
  {
    stage_number: 4,
    label: 'Release',
    description: 'The action being executed'
  },
  {
    stage_number: 5,
    label: 'Aftermath',
    description: 'Animation cooldown and return to base'
  }
]

// Predefined animation templates
export const ANIMATION_TEMPLATES = {
  'spell_casting': {
    title: 'Spell Casting',
    stages: [
      { stage_number: 1, label: 'Setup' as const, description: 'Wizard raises hands, preparing to cast' },
      { stage_number: 2, label: 'Build-up' as const, description: 'Magical energy gathering between palms' },
      { stage_number: 3, label: 'Climax' as const, description: 'Spell fully formed, crackling with energy' },
      { stage_number: 4, label: 'Release' as const, description: 'Spell cast forward with dramatic motion' },
      { stage_number: 5, label: 'Aftermath' as const, description: 'Hands lowered, residual magical effects fading' }
    ]
  },
  'sword_attack': {
    title: 'Sword Attack',
    stages: [
      { stage_number: 1, label: 'Setup' as const, description: 'Warrior grips sword, preparing to strike' },
      { stage_number: 2, label: 'Build-up' as const, description: 'Sword raised back, muscles tensed' },
      { stage_number: 3, label: 'Climax' as const, description: 'Peak of the swing, maximum force' },
      { stage_number: 4, label: 'Release' as const, description: 'Sword cutting through the air' },
      { stage_number: 5, label: 'Aftermath' as const, description: 'Follow-through and recovery pose' }
    ]
  },
  'walking_cycle': {
    title: 'Walking Cycle',
    stages: [
      { stage_number: 1, label: 'Setup' as const, description: 'Contact - left foot down, right foot up' },
      { stage_number: 2, label: 'Build-up' as const, description: 'Recoil - weight shifting forward' },
      { stage_number: 3, label: 'Climax' as const, description: 'Passing position - legs crossing' },
      { stage_number: 4, label: 'Release' as const, description: 'High point - right foot forward' },
      { stage_number: 5, label: 'Aftermath' as const, description: 'Contact - right foot down, left foot up' }
    ]
  },
  'jump': {
    title: 'Jump',
    stages: [
      { stage_number: 1, label: 'Setup' as const, description: 'Crouch down, preparing to jump' },
      { stage_number: 2, label: 'Build-up' as const, description: 'Spring loading, muscles coiled' },
      { stage_number: 3, label: 'Climax' as const, description: 'Launch - maximum extension upward' },
      { stage_number: 4, label: 'Release' as const, description: 'Airborne at peak height' },
      { stage_number: 5, label: 'Aftermath' as const, description: 'Landing preparation and recovery' }
    ]
  }
}
