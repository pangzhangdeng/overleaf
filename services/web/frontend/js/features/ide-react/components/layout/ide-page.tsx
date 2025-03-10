import { Alerts } from '@/features/ide-react/components/alerts/alerts'
import { MainLayout } from '@/features/ide-react/components/layout/main-layout'
import EditorLeftMenu from '@/features/editor-left-menu/components/editor-left-menu'
import { useLayoutEventTracking } from '@/features/ide-react/hooks/use-layout-event-tracking'
import useSocketListeners from '@/features/ide-react/hooks/use-socket-listeners'
import { useOpenFile } from '@/features/ide-react/hooks/use-open-file'
import { useEditingSessionHeartbeat } from '@/features/ide-react/hooks/use-editing-session-heartbeat'
import { useRegisterUserActivity } from '@/features/ide-react/hooks/use-register-user-activity'
import { useHasLintingError } from '@/features/ide-react/hooks/use-has-linting-error'
import { Modals } from '@/features/ide-react/components/modals/modals'

export default function IdePage() {
  useLayoutEventTracking() // sent event when the layout changes
  useSocketListeners() // listen for project-related websocket messages
  useEditingSessionHeartbeat() // send a batched event when user is active
  useRegisterUserActivity() // record activity and ensure connection when user is active
  useHasLintingError() // pass editor:lint hasLintingError to the compiler
  useOpenFile() // create ide.binaryFilesManager (TODO: move to the history file restore component)

  return (
    <>
      <Alerts />
      <Modals />
      <EditorLeftMenu />
      <MainLayout />
    </>
  )
}
