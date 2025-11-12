import React, { useRef, useEffect, useMemo } from 'react'
import Draggable from 'react-draggable'
import { X } from 'lucide-react'
import Highlighter from 'react-highlight-words'

const PREVIEW_SIZE = { width: 360, height: 480 }
const EXPORT_SIZE = { width: 1080, height: 1440 }
const BODY_FONT_SCALE = 3.5
const SCALE_RATIO = PREVIEW_SIZE.width / EXPORT_SIZE.width

const getBodyFontMetrics = (bodyFontSize) => {
  const base = Math.max(40, Math.round((bodyFontSize || 52) * BODY_FONT_SCALE))
  const preview = Math.max(14, Math.round(base * SCALE_RATIO))
  return { exportPx: base, previewPx: preview }
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

  const themeColors = getThemeColors(colorTheme)
  const { exportPx: exportBodyFontPx, previewPx: previewBodyFontPx } = useMemo(
    () => getBodyFontMetrics(bodyFontSize),
    [bodyFontSize]
  )
  const exportHighlightPad = Math.max(24, Math.round(exportBodyFontPx * 0.15))
  const highlightPaddingX = Math.max(8, Math.round(exportHighlightPad * SCALE_RATIO))
  const highlightPaddingY = Math.max(3, Math.round(previewBodyFontPx * 0.25))
  const highlightRadius = Math.max(12, Math.round(exportBodyFontPx * 0.3 * SCALE_RATIO))
  const highlightBorder = Math.max(2, Math.round(exportBodyFontPx * 0.06 * SCALE_RATIO))

  const handleEmojiDrag = (id, e, data) => {
    onEmojiUpdate(id, { x: data.x, y: data.y })
  }

  // 高亮搜索词配置
  const highlightWords = textContent.highlight ? [textContent.highlight] : []

  return (
    <div className="space-y-4">
      {/* 预览标题栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          <h3 className="text-sm font-semibold text-gray-700">实时预览</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>360×480</span>
          <span>•</span>
          <span>小红书封面</span>
        </div>
      </div>

      {/* 预览画布容器 - 重新设计布局 */}
      <div
        className="relative mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
        style={{ width: `${PREVIEW_SIZE.width}px`, height: `${PREVIEW_SIZE.height}px` }}
      >
        <div
          ref={canvasRef}
          className="relative w-full h-full"
          style={{ backgroundColor }}
        >
          {/* 安全区域参考线 */}
          <div className="absolute border border-dashed border-emerald-300/40 opacity-40 rounded-xl pointer-events-none"
               style={{
                 width: '312px',
                 height: '416px',
                 left: '24px',
                 top: '32px'
               }} />
          
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
                backgroundImage: 'linear-gradient(135deg, #A855F7, #22D3EE, #FDE047, #FF6B9C, #4ECDC4)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(34,211,238,0.3)',
                animation: 'gradientShift 4s ease-in-out infinite',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
              } : { 
                color: themeColors.primary,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              } }
            >
              {textContent.title}
            </h1>
          </div>

          {/* 正文内容 - 精确定位 */}
          <div className="absolute" style={{ top: '140px', left: '30px', right: '30px' }}>
            <div
              className="text-center leading-relaxed"
              style={{ 
                color: themeColors.primary,
                fontSize: `${previewBodyFontPx}px`,
                lineHeight: 1.5
              }}
            >
              <Highlighter
                searchWords={highlightWords}
                autoEscape={true}
                textToHighlight={textContent.body}
                highlightStyle={useGradientText
                  ? {
                      position: 'relative',
                      display: 'inline-block',
                      padding: `${highlightPaddingY}px ${highlightPaddingX}px`,
                      margin: '0 4px',
                      borderRadius: `${highlightRadius}px`,
                      background: 'linear-gradient(135deg, #FF6B9C 0%, #FF8E53 25%, #FFD166 50%, #4ECDC4 75%, #A78BFA 100%)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                      boxShadow: '0 3px 8px rgba(255,107,156,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
                      transform: 'translateY(-1px)',
                      border: '1px solid rgba(255,255,255,0.25)',
                    }
                  : {
                      position: 'relative',
                      display: 'inline-block',
                      padding: `${highlightPaddingY}px ${highlightPaddingX}px`,
                      margin: '0 4px',
                      borderRadius: `${highlightRadius}px`,
                      background: 'linear-gradient(120deg, rgba(255,235,59,0.95) 0%, rgba(255,245,59,0.85) 50%, rgba(255,235,59,0.95) 100%)',
                      color: '#1A202C',
                      fontWeight: 700,
                      boxShadow: '0 3px 6px rgba(255,193,7,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
                      borderBottom: `${highlightBorder}px solid rgba(255,193,7,0.7)`,
                      textShadow: '0 1px 1px rgba(255,255,255,0.7)',
                    }}
              />
            </div>
          </div>

          {/* 标签文字 - 精确定位 */}
          <div className="absolute" style={{ bottom: '60px', left: '30px' }}>
            <div
              className="text-sm font-bold px-4 py-2 rounded-full inline-block shadow-lg"
              style={{
                background: useGradientText 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : `linear-gradient(135deg, ${themeColors.secondary} 0%, ${themeColors.accent} 100%)`,
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.2)'
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
