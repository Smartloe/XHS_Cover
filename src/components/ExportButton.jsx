import React from 'react'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { BODY_FONT_SCALE, DEFAULT_BODY_FONT_SIZE } from '@/lib/design-tokens.js'

const ExportButton = ({
  template,
  textContent,
  colorTheme,
  backgroundColor,
  emojis,
  bodyFontSize = DEFAULT_BODY_FONT_SIZE,
  useGradientText = false,
}) => {
  // 绘制圆角矩形的辅助函数
  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  const handleExport = async () => {
    const toastId = toast.loading('正在生成图片…')
    try {
      const W = 1080, H = 1440
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')

      // 背景底色
      ctx.fillStyle = backgroundColor || '#FFFFFF'
      ctx.fillRect(0, 0, W, H)

      // 笔记本纹理（纯 Canvas，避免 html2canvas 差异）
      if (template && template.theme === 'notebook') {
        ctx.save()
        ctx.globalAlpha = 0.6
        ctx.strokeStyle = 'rgba(0,0,0,0.06)'
        const step = 84 // 预览 28px 的 3x
        if (template.pattern === 'lines') {
          ctx.lineWidth = 6
          for (let y = 0; y <= H; y += step) {
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(W, y)
            ctx.stroke()
          }
        } else if (template.pattern === 'grid') {
          ctx.lineWidth = 3
          for (let y = 0; y <= H; y += step) {
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(W, y)
            ctx.stroke()
          }
          for (let x = 0; x <= W; x += step) {
            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, H)
            ctx.stroke()
          }
        }
        ctx.restore()
      }

      const theme = getThemeColors(colorTheme)

      // 标题（Canvas 渐变文本，与预览保持一致）
      const padX = 90
      const titleTop = 180
      ctx.save()
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.font = 'bold 120px system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Arial, sans-serif'
      if (useGradientText) {
        // 与预览的彩虹渐变保持一致
        const grad = ctx.createLinearGradient(padX, titleTop, W - padX, titleTop)
        grad.addColorStop(0, '#A855F7')
        grad.addColorStop(0.25, '#22D3EE')
        grad.addColorStop(0.5, '#FDE047')
        grad.addColorStop(0.75, '#FF6B9C')
        grad.addColorStop(1, '#4ECDC4')
        ctx.fillStyle = grad
        ctx.shadowColor = 'rgba(168,85,247,0.4)'
        ctx.shadowBlur = 20
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        // 添加额外的发光效果
        ctx.save()
        ctx.shadowColor = 'rgba(34,211,238,0.3)'
        ctx.shadowBlur = 40
        ctx.fillText(textContent.title || '', W / 2, titleTop)
        ctx.restore()
      } else {
        ctx.fillStyle = theme.primary
        ctx.shadowColor = 'rgba(0,0,0,0.1)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
      }
      ctx.fillText(textContent.title || '', W / 2, titleTop)
      ctx.restore()

      // 正文（逐字测量换行 + 胶囊高亮）- 调整位置和大小
      const bodyTop = 420
      const maxWidth = W - padX * 2
      const fontPx = Math.max(40, Math.round((bodyFontSize || DEFAULT_BODY_FONT_SIZE) * BODY_FONT_SCALE))
      const lineH = Math.round(fontPx * 1.5)
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.font = `${fontPx}px system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Arial, sans-serif`
      ctx.fillStyle = theme.primary

      const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

      const tokenize = (text, highlight) => {
        if (!highlight) {
          return text
            .split(/(\s+)/)
            .filter((segment) => segment !== '')
            .map((segment) => ({
              text: segment,
              highlight: false,
              isSpace: /^\s+$/.test(segment)
            }))
        }
        const re = new RegExp(`(${escapeRegExp(highlight)})`, 'gi')
        const parts = text.split(re)
        const out = []
        for (const p of parts) {
          if (p === '') continue
          if (p.toLowerCase() === (highlight || '').toLowerCase()) {
            out.push({ text: p, highlight: true, isSpace: false })
          } else {
            // 保留空白
            const pieces = p.split(/(\s+)/)
            for (const pc of pieces) {
              if (pc === '') continue
              out.push({ text: pc, highlight: false, isSpace: /^\s+$/.test(pc) })
            }
          }
        }
        return out
      }

      const measureTokenWidth = (t) => {
        const w = ctx.measureText(t.text).width
        const pad = Math.max(24, Math.round(fontPx * 0.15)) // 增加高亮胶囊的内边距
        return t.highlight ? w + pad * 2 : w
      }

      const layoutLines = (text, highlight) => {
        const splitToken = (token) => {
          if (!token.text?.trim() || token.isSpace) return [token]
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

        const tokens = tokenize(text, highlight).flatMap(splitToken)
        const lines = []
        let current = [], width = 0
        for (const t of tokens) {
          const isSpace = t.isSpace
          const tw = measureTokenWidth(t)
          if (width + tw > maxWidth && current.length) {
            lines.push(current)
            current = []
            width = 0
            if (isSpace) continue // 行首丢弃多余空白
          }
          if (current.length === 0 && isSpace) continue
          current.push(t)
          width += tw
        }
        if (current.length) lines.push(current)
        return lines
      }

      const drawRoundedRect = (x, y, w, h, r) => {
        const rr = Math.min(r, h / 2, w / 2)
        ctx.beginPath()
        ctx.moveTo(x + rr, y)
        ctx.arcTo(x + w, y, x + w, y + h, rr)
        ctx.arcTo(x + w, y + h, x, y + h, rr)
        ctx.arcTo(x, y + h, x, y, rr)
        ctx.arcTo(x, y, x + w, y, rr)
        ctx.closePath()
      }

      const bodyText = (textContent.body || '').replace(/\r\n/g, '\n')
      const paragraphs = bodyText.split('\n')
      let y = bodyTop

      for (let pi = 0; pi < paragraphs.length; pi++) {
        const lines = layoutLines(paragraphs[pi], textContent.highlight)
        for (const line of lines) {
          let lw = 0
          for (const t of line) lw += measureTokenWidth(t)
          let x = Math.round((W - lw) / 2)

          for (const t of line) {
            if (t.highlight) {
              // 圆角胶囊高亮效果，与预览保持一致
              const textW = ctx.measureText(t.text).width
              const padX = Math.max(24, Math.round(fontPx * 0.15))
              const bandW = textW + padX * 2
              const bandH = Math.round(fontPx * 0.8)
              const bandX = x
              const bandY = y + Math.round(fontPx * 0.1)
              const radius = Math.round(bandH * 0.5) // 圆角半径为高度的一半

              ctx.save()
              // 绘制圆角矩形高亮背景
              drawRoundedRect(ctx, bandX, bandY, bandW, bandH, radius)

              // 渐变高亮效果，与预览保持一致
              if (useGradientText) {
                // 渐变荧光笔效果 - 五彩渐变
                const g = ctx.createLinearGradient(bandX, bandY, bandX + bandW, bandY)
                g.addColorStop(0, '#FF6B9C')
                g.addColorStop(0.25, '#FF8E53')
                g.addColorStop(0.5, '#FFD166')
                g.addColorStop(0.75, '#4ECDC4')
                g.addColorStop(1, '#A78BFA')
                ctx.fillStyle = g
                
                // 阴影效果
                ctx.shadowColor = 'rgba(255,107,156,0.4)'
                ctx.shadowBlur = 9
                ctx.shadowOffsetX = 0
                ctx.shadowOffsetY = 3
                ctx.fill()
                
                // 边框高光
                ctx.save()
                ctx.strokeStyle = 'rgba(255,255,255,0.3)'
                ctx.lineWidth = 3
                drawRoundedRect(ctx, bandX, bandY, bandW, bandH, radius)
                ctx.stroke()
                ctx.restore()
              } else {
                // 经典荧光笔效果 - 黄色渐变
                const g = ctx.createLinearGradient(bandX, bandY, bandX + bandW, bandY)
                g.addColorStop(0, 'rgba(255,235,59,0.95)')
                g.addColorStop(0.5, 'rgba(255,245,59,0.8)')
                g.addColorStop(1, 'rgba(255,235,59,0.95)')
                ctx.fillStyle = g
                
                // 阴影效果
                ctx.shadowColor = 'rgba(255,193,7,0.4)'
                ctx.shadowBlur = 9
                ctx.shadowOffsetX = 0
                ctx.shadowOffsetY = 3
                ctx.fill()
                
                // 底部边框
                ctx.save()
                ctx.strokeStyle = 'rgba(255,193,7,0.7)'
                ctx.lineWidth = 6
                ctx.beginPath()
                ctx.moveTo(bandX + radius, bandY + bandH - 3)
                ctx.lineTo(bandX + bandW - radius, bandY + bandH - 3)
                ctx.stroke()
                ctx.restore()
                
                // 顶部高光
                ctx.save()
                ctx.strokeStyle = 'rgba(255,255,255,0.6)'
                ctx.lineWidth = 3
                drawRoundedRect(ctx, bandX, bandY, bandW, bandH, radius)
                ctx.stroke()
                ctx.restore()
              }
              ctx.restore()

              // 绘制高亮文字（与预览保持一致的颜色）
              if (useGradientText) {
                ctx.fillStyle = '#FFFFFF'
                ctx.shadowColor = 'rgba(0,0,0,0.3)'
                ctx.shadowBlur = 4
                ctx.shadowOffsetX = 0
                ctx.shadowOffsetY = 2
              } else {
                ctx.fillStyle = '#1A202C'
                ctx.shadowColor = 'rgba(255,255,255,0.8)'
                ctx.shadowBlur = 2
                ctx.shadowOffsetX = 0
                ctx.shadowOffsetY = 1
              }
              ctx.fillText(t.text, x + padX, y)
              x += bandW
            } else {
              ctx.fillStyle = theme.primary
              ctx.fillText(t.text, x, y)
              x += ctx.measureText(t.text).width
            }
          }
          y += lineH
        }
        if (pi !== paragraphs.length - 1) y += Math.round(lineH * 0.5)
      }

      // 标签（圆角胶囊）- 调整到左下角，优化尺寸
      const tagText = `#${textContent.tag || ''}`
      ctx.save()
      ctx.font = '500 48px system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Arial, sans-serif'
      const tagTextW = ctx.measureText(tagText).width
      const tagPadX = 72, tagPadY = 36
      const tagW = Math.ceil(tagTextW + tagPadX * 2)
      const tagH = 48 + tagPadY * 2
      const tagX = 90 // 左对齐，距离左边90px
      const tagY = H - 180 - tagH
      ctx.shadowColor = 'rgba(0,0,0,0.2)'
      ctx.shadowBlur = 25
      
      // 渐变背景效果，与预览保持一致
      if (useGradientText) {
        const grad = ctx.createLinearGradient(tagX, tagY, tagX + tagW, tagY + tagH)
        grad.addColorStop(0, '#667eea')
        grad.addColorStop(1, '#764ba2')
        ctx.fillStyle = grad
      } else {
        const grad = ctx.createLinearGradient(tagX, tagY, tagX + tagW, tagY + tagH)
        grad.addColorStop(0, theme.secondary)
        grad.addColorStop(1, theme.accent)
        ctx.fillStyle = grad
      }
      
      drawRoundedRect(tagX, tagY, tagW, tagH, tagH / 2)
      ctx.fill()
      
      // 内发光效果
      ctx.save()
      ctx.globalCompositeOperation = 'overlay'
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      drawRoundedRect(tagX, tagY, tagW, tagH / 3, tagH / 2)
      ctx.fill()
      ctx.restore()
      
      ctx.shadowBlur = 0
      ctx.fillStyle = '#FFFFFF'
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 2
      // 标签内文字水平居中
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(tagText, tagX + Math.round(tagW / 2), tagY + tagPadY)
      ctx.restore()

      // Emoji（旋转 + 缩放）- 调整尺寸和位置
      for (const em of (emojis || [])) {
        const scale = em.scale ?? 1
        const size = Math.max(24, Math.round(108 * scale)) // 减小基础尺寸
        ctx.save()
        ctx.font = `${size}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji","Segoe UI Symbol",sans-serif`
        ctx.textBaseline = 'top'
        const px = (em.x ?? 160) * 3 // 调整默认位置
        const py = (em.y ?? 220) * 3 // 调整默认位置
        ctx.translate(px, py)
        const angle = ((em.rotation ?? 0) * Math.PI) / 180
        ctx.rotate(angle)
        ctx.fillText(em.symbol || '', 0, 0)
        ctx.restore()
      }

      // 下载
      const link = document.createElement('a')
      link.download = `小红书封面_${Date.now()}.png`
      link.href = canvas.toDataURL('image/png', 0.95)
      link.click()

      toast.success('已开始下载图片', { id: toastId, duration: 2000 })
    } catch (error) {
      console.error('导出失败:', error)
      toast.error('导出失败，请重试', { id: toastId })
    }
  }

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

  return (
    <div className="space-y-4">
      <button
        onClick={handleExport}
        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 font-bold text-lg ripple-effect"
      >
        <Download size={24} />
        <span>下载高清封面</span>
      </button>
      
      <div className="text-center text-xs text-gray-500">
        <p>点击下载 1080×1440 高清PNG图片</p>
        <p className="mt-1">完美适配小红书封面尺寸</p>
      </div>
    </div>
  )
}

export default ExportButton
