import { SpriteWorkflowEditor } from '@/components/canvas/sprite-workflow-editor'

export default function SpriteWorkflowPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <SpriteWorkflowEditor />
    </div>
  )
}

export const metadata = {
  title: 'Sprite Workflow - Tessera',
  description: 'Advanced sprite sheet animation workflow with staged generation',
}
