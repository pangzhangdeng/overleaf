import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useProjectContext } from '../../../shared/context/project-context'
import { debugConsole } from '@/utils/debugging'
import useAbortController from '../../../shared/hooks/use-abort-controller'

const MAX_FILE_SIZE = 2 * 1024 * 1024

export default function FileViewText({ file, onLoad, onError }) {
  const { _id: projectId } = useProjectContext({
    _id: PropTypes.string.isRequired,
  })

  const [textPreview, setTextPreview] = useState('')
  const [shouldShowDots, setShouldShowDots] = useState(false)
  const [inFlight, setInFlight] = useState(false)

  const fetchContentLengthController = useAbortController()
  const fetchDataController = useAbortController()

  useEffect(() => {
    if (inFlight) {
      return
    }
    let path = `/project/${projectId}/file/${file.id}`
    const fetchContentLengthTimeout = setTimeout(
      () => fetchContentLengthController.abort(),
      10000
    )
    let fetchDataTimeout
    fetch(path, { method: 'HEAD', signal: fetchContentLengthController.signal })
      .then(response => {
        if (!response.ok) throw new Error('HTTP Error Code: ' + response.status)
        return response.headers.get('Content-Length')
      })
      .then(fileSize => {
        let truncated = false
        let maxSize = null
        if (fileSize > MAX_FILE_SIZE) {
          truncated = true
          maxSize = MAX_FILE_SIZE
        }

        if (maxSize != null) {
          path += `?range=0-${maxSize}`
        }
        fetchDataTimeout = setTimeout(() => fetchDataController.abort(), 60000)
        return fetch(path, { signal: fetchDataController.signal }).then(
          response => {
            return response.text().then(text => {
              if (truncated) {
                text = text.replace(/\n.*$/, '')
              }

              setTextPreview(text)
              onLoad()
              setShouldShowDots(truncated)
            })
          }
        )
      })
      .catch(err => {
        debugConsole.error('Error fetching file contents', err)
        onError()
      })
      .finally(() => {
        setInFlight(false)
        clearTimeout(fetchContentLengthTimeout)
        clearTimeout(fetchDataTimeout)
      })
  }, [
    projectId,
    file.id,
    onError,
    onLoad,
    inFlight,
    fetchContentLengthController,
    fetchDataController,
  ])
  return (
    <div>
      {textPreview && (
        <div className="text-preview">
          <div className="scroll-container">
            <p>{textPreview}</p>
            {shouldShowDots && <p>...</p>}
          </div>
        </div>
      )}
    </div>
  )
}

FileViewText.propTypes = {
  file: PropTypes.shape({ id: PropTypes.string }).isRequired,
  onLoad: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
}
