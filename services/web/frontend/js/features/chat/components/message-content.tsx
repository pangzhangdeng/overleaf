import { useRef, useEffect, type FC } from 'react'
// @ts-ignore
import Linkify from 'react-linkify'
import { loadMathJax } from '../../../../../modules/source-editor/frontend/js/utils/mathjax'
import useIsMounted from '../../../shared/hooks/use-is-mounted'
import { configureMathJax } from '../../mathjax/configure'

const MessageContent: FC<{ content: string }> = ({ content }) => {
  const root = useRef<HTMLDivElement | null>(null)
  const mounted = useIsMounted()

  useEffect(() => {
    if (root.current) {
      // adds attributes to all the links generated by <Linkify/>, required due to https://github.com/tasti/react-linkify/issues/99
      for (const a of root.current.getElementsByTagName('a')) {
        a.setAttribute('target', '_blank')
        a.setAttribute('rel', 'noreferrer noopener')
      }

      // MathJax v2 typesetting
      if (window.MathJax?.Hub) {
        const timeout = setTimeout(() => {
          configureMathJax()

          window.MathJax.Hub.Queue([
            'Typeset',
            window.MathJax.Hub,
            root.current,
          ])
        }, 0)

        return () => clearTimeout(timeout)
      }

      // MathJax v3 typesetting
      loadMathJax()
        .then(MathJax => {
          if (mounted.current) {
            MathJax.typesetPromise([root.current]).catch((error: Error) => {
              console.error(error)
            })
          }
        })
        .catch(error => {
          console.error(error)
        })
    }
  }, [content, mounted])

  return (
    <p ref={root}>
      <Linkify>{content}</Linkify>
    </p>
  )
}

export default MessageContent