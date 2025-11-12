import React, { useRef, useEffect, useMemo, useState } from 'react'
import Draggable from 'react-draggable'
import { X } from 'lucide-react'
import { BODY_FONT_SCALE, DEFAULT_BODY_FONT_SIZE } from '@/lib/design-tokens.js'

const PREVIEW_SIZE = { width: 360, height: 480 }
const EXPORT_SIZE = { width: 1080, height: 1440 }
const SCALE_RATIO = PREVIEW_SIZE.width / EXPORT_SIZE.width
const BODY_FONT_FAMILY = 'system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Arial, sans-serif'
const EXPORT_BODY_PAD_X = 90
const EXPORT_MAX_BODY_WIDTH = EXPORT_SIZE.width - EXPORT_BODY_PAD_X * 2
const PREVIEW_MAX_BODY_WIDTH = Math.round(EXPORT_MAX_BODY_WIDTH * SCALE_RATIO)

const getBodyFontMetrics = (bodyFontSize) => {
  const base = Math.max(40, Math.round((bodyFontSize || DEFAULT_BODY_FONT_SIZE) * BODY_FONT_SCALE))
  const preview = Math.max(14, Math.round(base * SCALE_RATIO))
  return { exportPx: base, previewPx: preview }
}

const escapeRegExp = (s = '') => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const tokenizeText = (text = '', highlight = '') => {
  if (!highlight) return [{ text, highlight: false }]
  const re = new RegExp(`(${escapeRegExp(highlight)})`, 'gi')
  const parts = text.split(re)
  const output = []
  for (const part of parts) {
    if (part === '') continue
    if (part.toLowerCase() === highlight.toLowerCase()) {
      output.push({ text: part, highlight: true })
    } else {
      const pieces = part.split(/(\s+)/)
      for (const piece of pieces) {
        if (piece === '') continue
        output.push({ text: piece, highlight: false, isSpace: /^\s+$/.test(piece) })
      }
    }
  }
  return output
}

const layoutLines = (text, highlightWord, ctx, maxWidth, fontPx) => {
  const originalTokens = tokenizeText(text, highlightWord)
  const lines = []
  let current = []
  let width = 0

  const measureTokenWidth = (token) => {
    const textWidth = ctx.measureText(token.text).width
    const pad = Math.max(24, Math.round(fontPx * 0.15))
    return token.highlight ? textWidth + pad * 2 : textWidth
  }

  const splitToken = (token) => {
    if (!ctx) return [token]
    if (!token.text?.trim() || /^\s+$/.test(token.text)) return [token]
    const pieces = []
    let buffer = ''
    for (const char of Array.from(token.text)) {
      const nextValue = buffer + char
      const nextWidth = measureTokenWidth({ ...token, text: nextValue })
      if (nextWidth > maxWidth && buffer) {
        pieces.push({ ...token, text: buffer })
        buffer = char
      } else if (nextWidth > maxWidth) {
        pieces.push({ ...token, text: char })
        buffer = ''
      } else {
        buffer = nextValue
      }
    }
    if (buffer) {
      pieces.push({ ...token, text: buffer })
    }
    return pieces.length ? pieces : [token]
  }

  const tokens = originalTokens.flatMap(splitToken)

  for (const token of tokens) {
    const tokenWidth = measureTokenWidth(token)
    const isSpace = token.isSpace

    if (width + tokenWidth > maxWidth && current.length) {
      lines.push(current)
      current = []
      width = 0
      if (isSpace) continue
    }

    if (current.length === 0 && isSpace) continue

    current.push({ ...token, width: tokenWidth })
    width += tokenWidth
  }

  if (current.length) lines.push(current)
  return lines
}

const layoutParagraphs = (text = '', highlightWord, ctx, fontPx) => {
  if (!ctx) return []
  const normalized = text.replace(/\r\n/g, '\n')
  const paragraphs = normalized.split('\n')
  const allLines = []

  paragraphs.forEach((paragraph, index) => {
    const lines = layoutLines(paragraph, highlightWord, ctx, EXPORT_MAX_BODY_WIDTH, fontPx)
    lines.forEach((line) => allLines.push({ type: 'line', tokens: line }))
    if (index !== paragraphs.length - 1) {
      allLines.push({ type: 'gap', id: `gap-${index}` })
    }
  })

  return allLines
}

const PreviewCanvas = ({
  template,
  textContent,
  colorTheme,
  backgroundColor,
  useGradientText,
  bodyFontSize,
  emojis,
  selectedEmojiId,
  setSelectedEmojiId,
  onEmojiUpdate,
  onEmojiDelete
}) => {
  const canvasRef = useRef(null)
  const emojiRefs = useRef(new Map())
  const measureCtxRef = useRef(null)
  const previewShellRef = useRef(null)
  const [previewScale, setPreviewScale] = useState(1)
  const interactionRef = useRef({
    type: null, // 'scale' | 'rotate'
    id: null,
    startScale: 1,
    startRotation: 0,
    startAngle: 0,
    startDistance: 0,
    center: { x: 0, y: 0 },
  })

  const getElementCenter = (el) => {
    const rect = el.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }

  const onScaleMouseDown = (id, e) => {
    e.stopPropagation()
    setSelectedEmojiId?.(id)
    const el = emojiRefs.current.get(id)
    if (!el) return
    const center = getElementCenter(el)
    const dx = e.clientX - center.x
    const dy = e.clientY - center.y
    const startDistance = Math.hypot(dx, dy)
    const target = emojis.find((em) => em.id === id)
    interactionRef.current = {
      type: 'scale',
      id,
      startScale: target?.scale ?? 1,
      startRotation: target?.rotation ?? 0,
      startAngle: 0,
      startDistance,
      center,
    }
    window.addEventListener('mousemove', onGlobalMouseMove)
    window.addEventListener('mouseup', onGlobalMouseUp)
  }

  const onRotateMouseDown = (id, e) => {
    e.stopPropagation()
    setSelectedEmojiId?.(id)
    const el = emojiRefs.current.get(id)
    if (!el) return
    const center = getElementCenter(el)
    const startAngle = Math.atan2(e.clientY - center.y, e.clientX - center.x)
    const target = emojis.find((em) => em.id === id)
    interactionRef.current = {
      type: 'rotate',
      id,
      startScale: target?.scale ?? 1,
      startRotation: target?.rotation ?? 0,
      startAngle,
      startDistance: 0,
      center,
    }
    window.addEventListener('mousemove', onGlobalMouseMove)
    window.addEventListener('mouseup', onGlobalMouseUp)
  }

  const onGlobalMouseMove = (e) => {
    const it = interactionRef.current
    if (!it?.type || it?.id == null) return
    if (it.type === 'scale') {
      const dx = e.clientX - it.center.x
      const dy = e.clientY - it.center.y
      const distance = Math.hypot(dx, dy)
      const ratio = it.startDistance ? distance / it.startDistance : 1
      const nextScale = Math.max(0.3, Math.min(3, (it.startScale ?? 1) * ratio))
      onEmojiUpdate(it.id, { scale: nextScale })
    } else if (it.type === 'rotate') {
      const angle = Math.atan2(e.clientY - it.center.y, e.clientX - it.center.x)
      const delta = angle - (it.startAngle ?? 0)
      const nextRotation = (it.startRotation ?? 0) + (delta * 180) / Math.PI
      onEmojiUpdate(it.id, { rotation: nextRotation })
    }
  }

  const onGlobalMouseUp = () => {
    window.removeEventListener('mousemove', onGlobalMouseMove)
    window.removeEventListener('mouseup', onGlobalMouseUp)
    interactionRef.current = { type: null, id: null }
  }

  // 键盘删除选中的 Emoji
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Delete' && selectedEmojiId != null) {
        onEmojiDelete(selectedEmojiId)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedEmojiId, onEmojiDelete])

  const getThemeColors = (theme) => {
    const themes = {
      morandi: { primary: '#8B7355', secondary: '#A89F91', accent: '#D4A574' },
      orange: { primary: '#FF6B35', secondary: '#FF8C42', accent: '#FFB347' },
      instagram: { primary: '#E1306C', secondary: '#F77737', accent: '#FFDC80' },
      green: { primary: '#4CAF50', secondary: '#8BC34A', accent: '#CDDC39' },
      pink: { primary: '#FF69B4', secondary: '#FFB6C1', accent: '#FFC0CB' },
      gray: { primary: '#696969', secondary: '#808080', accent: '#A9A9A9' },
      notebook: { primary: '#2C3E50', secondary: '#34495E', accent: '#7F8C8D' }
    }
    return themes[theme] || themes.morandi
  }

  if (typeof document !== 'undefined' && !measureCtxRef.current) {
    const canvas = document.createElement('canvas')
    measureCtxRef.current = canvas.getContext('2d')
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!previewShellRef.current || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const innerWidth = Math.max(120, entry.contentRect.width - 24)
      const nextScale = Math.min(1, Math.max(0.5, innerWidth / PREVIEW_SIZE.width))
      setPreviewScale(Number(nextScale.toFixed(2)))
    })
    observer.observe(previewShellRef.current)
    return () => observer.disconnect()
  }, [])

  const themeColors = getThemeColors(colorTheme)
  const { exportPx: exportBodyFontPx, previewPx: previewBodyFontPx } = useMemo(
    () => getBodyFontMetrics(bodyFontSize),
    [bodyFontSize]
  )
  const exportHighlightPad = Math.max(24, Math.round(exportBodyFontPx * 0.15))
  const highlightPaddingX = Math.max(8, Math.round(exportHighlightPad * SCALE_RATIO))
  const highlightPaddingY = Math.max(3, Math.round(exportBodyFontPx * 0.08 * SCALE_RATIO))
  const highlightRadius = Math.max(12, Math.round(exportBodyFontPx * 0.3 * SCALE_RATIO))
  const highlightBorder = Math.max(2, Math.round(exportBodyFontPx * 0.06 * SCALE_RATIO))
  const exportLineHeight = Math.round(exportBodyFontPx * 1.5)
  const previewLineHeight = Math.max(18, Math.round(exportLineHeight * SCALE_RATIO))
  const previewParagraphGap = Math.max(8, Math.round(exportLineHeight * 0.5 * SCALE_RATIO))

  const bodyLines = useMemo(() => {
    const ctx = measureCtxRef.current
    if (!ctx) return []
    ctx.font = `${exportBodyFontPx}px ${BODY_FONT_FAMILY}`
    return layoutParagraphs(textContent.body || '', textContent.highlight, ctx, exportBodyFontPx)
  }, [textContent.body, textContent.highlight, exportBodyFontPx])

  const handleEmojiDrag = (id, e, data) => {
    onEmojiUpdate(id, { x: data.x, y: data.y })
  }

  return (
    <div className="space-y-4">
      {/* 预览标题栏 */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <h3 className="text-base font-semibold text-gray-900">实时预览</h3>
        <span>360×480 · 小红书封面</span>
      </div>

      {/* 预览画布容器 */}
      <div ref={previewShellRef} className="w-full">
        <div
          className="flex justify-center"
          style={{ height: `${PREVIEW_SIZE.height * previewScale}px` }}
        >
          <div
            style={{
              width: `${PREVIEW_SIZE.width * previewScale}px`,
              height: `${PREVIEW_SIZE.height * previewScale}px`,
            }}
          >
            <div
              className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
              style={{
                width: `${PREVIEW_SIZE.width}px`,
                height: `${PREVIEW_SIZE.height}px`,
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left'
              }}
            >
              <div
                ref={canvasRef}
                className="relative w-full h-full"
                style={{ backgroundColor }}
              >
            {/* 模板背景 */}
            {template && (
              template.theme === 'notebook' ? (
                <div
                  className="absolute inset-0"
                  style={{
                    ...(template.pattern === 'lines'
                      ? {
                          backgroundImage:
                            'repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 2px, transparent 2px, transparent 28px)',
                        }
                      : template.pattern === 'grid'
                      ? {
                          backgroundImage:
                            'repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 28px)',
                        }
                      : {}),
                    opacity: 0.6,
                  }}
                />
              ) : (
                <img
                  src={template.preview}
                  alt="模板背景"
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
              )
            )}

            {/* 主标题 - 精确定位 */}
            <div className="absolute" style={{ top: '60px', left: '30px', right: '30px' }}>
              <h1
                className="text-2xl font-bold text-center leading-tight"
                style={ useGradientText ? {
                  backgroundImage: 'linear-gradient(120deg, #6366f1, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  textShadow: 'none',
                } : { 
                  color: themeColors.primary,
                  textShadow: 'none',
                } }
              >
                {textContent.title}
              </h1>
            </div>

            {/* 正文内容 - 精确定位 */}
            <div className="absolute" style={{ top: '140px', left: '30px', right: '30px' }}>
              <div
                className="mx-auto text-center font-medium"
                style={{
                  color: themeColors.primary,
                  fontSize: `${previewBodyFontPx}px`,
                  lineHeight: `${previewLineHeight}px`,
                  width: `${PREVIEW_MAX_BODY_WIDTH}px`,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {bodyLines.length > 0
                  ? bodyLines.map((line, idx) =>
                      line.type === 'gap' ? (
                        <div key={line.id || `gap-${idx}`} style={{ height: `${previewParagraphGap}px` }} />
                      ) : (
                        <div
                          key={`line-${idx}`}
                          className="w-full flex justify-center"
                          style={{
                            gap: `${Math.max(2, Math.round(previewBodyFontPx * 0.05))}px`,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {line.tokens.map((token, tokenIdx) =>
                            token.highlight ? (
                              <span
                                key={`token-${tokenIdx}-${token.text}`}
                                style={
                                  useGradientText
                                    ? {
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: `${highlightPaddingY}px ${highlightPaddingX}px`,
                                        margin: '0 2px',
                                        borderRadius: `${highlightRadius}px`,
                                        background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                                        color: '#FFFFFF',
                                        fontWeight: 600,
                                        letterSpacing: '0.5px',
                                        whiteSpace: 'pre',
                                      }
                                    : {
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: `${highlightPaddingY}px ${highlightPaddingX}px`,
                                        margin: '0 2px',
                                        borderRadius: `${highlightRadius}px`,
                                        backgroundColor: '#FFF7CC',
                                        color: '#1F2933',
                                        fontWeight: 600,
                                        borderBottom: `${highlightBorder}px solid rgba(0,0,0,0.05)`,
                                        whiteSpace: 'pre',
                                      }
                                }
                              >
                                {token.text}
                              </span>
                            ) : (
                              <span key={`token-${tokenIdx}-${token.text}`} style={{ whiteSpace: 'pre' }}>
                                {token.text}
                              </span>
                            )
                          )}
                        </div>
                      )
                    )
                  : (
                    <span style={{ whiteSpace: 'pre-wrap' }}>{textContent.body}</span>
                  )}
              </div>
            </div>

            {/* 标签文字 - 精确定位 */}
            <div className="absolute" style={{ bottom: '60px', left: '30px' }}>
              <div
                className="text-sm font-bold px-4 py-2 rounded-full inline-block shadow-lg"
                style={{
                  background: useGradientText 
                    ? '#4c1d95'
                    : themeColors.secondary,
                  color: '#FFFFFF',
                  boxShadow: 'none',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
              >
                #{textContent.tag}
              </div>
            </div>

            {/* Emoji表情 - 优化交互 */}
            {emojis.map((emoji) => (
              <Draggable
                key={emoji.id}
                position={{ x: (emoji.x ?? 160), y: (emoji.y ?? 220) }}
                onDrag={(e, data) => handleEmojiDrag(emoji.id, e, data)}
                cancel=".no-drag"
                bounds="parent"
                scale={previewScale}
              >
                <div
                  ref={(el) => emojiRefs.current.set(emoji.id, el)}
                  className={`absolute group select-none cursor-move ${selectedEmojiId === emoji.id ? 'ring-2 ring-emerald-400 rounded-lg shadow-lg' : ''}`}
                  onClick={() => setSelectedEmojiId?.(emoji.id)}
                  style={{
                    transform: `rotate(${emoji.rotation ?? 0}deg)`,
                    transformOrigin: 'center center',
                  }}
                >
                  <span
                    className="leading-none select-none drop-shadow-sm"
                    style={{ fontSize: `${32 * (emoji.scale ?? 1)}px`, lineHeight: '1' }}
                  >
                    {emoji.symbol}
                  </span>

                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onEmojiDelete(emoji.id) }}
                    className="no-drag absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110 shadow-lg"
                    title="删除"
                  >
                    <X size={12} />
                  </button>

                  {/* 缩放与旋转控制柄 */}
                  {selectedEmojiId === emoji.id && (
                    <>
                      <div
                        onMouseDown={(e) => onScaleMouseDown(emoji.id, e)}
                        className="no-drag absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-emerald-400 rounded-full cursor-se-resize shadow-lg hover:scale-110 transition-transform"
                        title="缩放"
                      />
                      <div
                        onMouseDown={(e) => onRotateMouseDown(emoji.id, e)}
                        className="no-drag absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-emerald-400 rounded-full cursor-crosshair shadow-lg hover:scale-110 transition-transform"
                        title="旋转"
                      />
                    </>
                  )}
                </div>
              </Draggable>
            ))}

            {/* 安全区域参考线 */}
            <div
              className="absolute border border-dashed border-emerald-300/60 rounded-xl pointer-events-none"
              style={{
                width: '312px',
                height: '416px',
                left: '24px',
                top: '32px'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>

      {/* 操作提示 */}
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
        <div className="flex items-start gap-2 text-xs text-gray-600">
          <span className="text-emerald-500">💡</span>
          <div>
            <p className="font-medium mb-1">操作提示：</p>
            <ul className="space-y-1">
              <li>• 点击贴纸可选中，拖拽可移动位置</li>
              <li>• 选中后拖拽右下角缩放，右上角旋转</li>
              <li>• 按 Delete 键可快速删除选中的贴纸</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreviewCanvas
