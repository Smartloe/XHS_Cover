import React, { useState, useEffect } from 'react'
import TemplatePanel from '../components/TemplatePanel.jsx'
import TextEditor from '../components/TextEditor.jsx'
import ColorPanel from '../components/ColorPanel.jsx'
import EmojiPanel from '../components/EmojiPanel.jsx'
import PreviewCanvas from '../components/PreviewCanvas.jsx'
import ExportButton from '../components/ExportButton.jsx'
import { DEFAULT_BODY_FONT_SIZE } from '@/lib/design-tokens.js'

const Index = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const defaultText = {
    title: '点击编辑主标题',
    highlight: '高亮关键词',
    body: '在这里输入正文内容，包含高亮关键词的部分会自动高亮显示...',
    tag: '好物分享'
  }
  const [textContent, setTextContent] = useState(defaultText)
  const [colorTheme, setColorTheme] = useState('morandi')
  const [backgroundColor, setBackgroundColor] = useState('#F8F5F2')
  const [emojis, setEmojis] = useState([])
  const [bodyFontSize, setBodyFontSize] = useState(DEFAULT_BODY_FONT_SIZE)
  const [selectedEmojiId, setSelectedEmojiId] = useState(null)
  const [useGradientText, setUseGradientText] = useState(false)

  // 本地状态恢复
  useEffect(() => {
    try {
      const saved = localStorage.getItem('xhs_cover_state_v1')
      if (saved) {
        const s = JSON.parse(saved)
        if (s.selectedTemplate !== undefined) setSelectedTemplate(s.selectedTemplate)
        if (s.textContent) setTextContent(s.textContent)
        if (s.colorTheme) setColorTheme(s.colorTheme)
        if (s.backgroundColor) setBackgroundColor(s.backgroundColor)
        if (Array.isArray(s.emojis)) setEmojis(s.emojis)
        if (typeof s.bodyFontSize === 'number') setBodyFontSize(s.bodyFontSize)
        if (typeof s.useGradientText === 'boolean') setUseGradientText(s.useGradientText)
        if (s.selectedEmojiId !== undefined) setSelectedEmojiId(s.selectedEmojiId)
      }
    } catch (e) {
      console.warn('恢复本地状态失败', e)
    }
    // 仅首次恢复
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 本地状态持久化
  useEffect(() => {
    const state = { selectedTemplate, textContent, colorTheme, backgroundColor, emojis, bodyFontSize, selectedEmojiId, useGradientText }
    try {
      localStorage.setItem('xhs_cover_state_v1', JSON.stringify(state))
    } catch (e) {
      console.warn('保存本地状态失败', e)
    }
  }, [selectedTemplate, textContent, colorTheme, backgroundColor, emojis, bodyFontSize, selectedEmojiId, useGradientText])

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    // 保留用户已编辑的文案，不重置
    setColorTheme(template.theme || 'morandi')
    setBackgroundColor(template.backgroundColor || '#F8F5F2')
  }

  const handleEmojiAdd = (emoji) => {
    const newEmoji = {
      id: Date.now(),
      ...emoji,
      // 以预览画布中心为默认位置（360x480 → 中心为 180,240）
      x: 180,
      y: 240,
      // 交互增强：默认缩放/旋转
      scale: 1,
      rotation: 0,
    }
    setEmojis([...emojis, newEmoji])
    setSelectedEmojiId(newEmoji.id)
  }

  const handleEmojiUpdate = (id, updates) => {
    setEmojis(emojis.map(emoji => 
      emoji.id === id ? { ...emoji, ...updates } : emoji
    ))
  }

  const handleEmojiDelete = (id) => {
    setEmojis(emojis.filter(emoji => emoji.id !== id))
    if (selectedEmojiId === id) setSelectedEmojiId(null)
  }

  return (
    <div className="min-h-screen fresh-bg">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <header className="mb-12 text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">XHS Cover</p>
          <h1 className="text-3xl font-semibold text-gray-900">小红书封面生成器</h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            精选模板、文案编辑、色彩与贴纸都集中在一处，几分钟内导出 1080×1440 PNG 封面。
          </p>
        </header>

        {/* 主要内容区域 - 紧凑布局 */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(360px,1fr)]">
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* 模板选择 */}
              <section id="template" className="soft-card p-6 scroll-mt-24 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                      <span className="text-xl">🎨</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">选择模板</h2>
                      <p className="text-xs text-gray-600 mt-1">从精美模板开始设计</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">步骤 1/4</span>
                </div>
                <TemplatePanel
                  onTemplateSelect={handleTemplateSelect}
                  selectedTemplate={selectedTemplate}
                />
              </section>

              {/* 配色背景 */}
              <section id="color" className="soft-card p-6 scroll-mt-24 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                      <span className="text-xl">🌈</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">配色方案</h2>
                      <p className="text-xs text-gray-600 mt-1">选择完美的色彩搭配</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">步骤 2/4</span>
                </div>
                <ColorPanel
                  theme={colorTheme}
                  onThemeChange={setColorTheme}
                  backgroundColor={backgroundColor}
                  onBackgroundColorChange={setBackgroundColor}
                />
              </section>
            </div>

            {/* 文案编辑 */}
            <section id="editor" className="soft-card p-6 scroll-mt-24 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                    <span className="text-xl">✏️</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">编辑文案</h2>
                    <p className="text-sm text-gray-600 mt-1">打造吸睛标题与正文</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">步骤 3/4</span>
              </div>
              <TextEditor
                content={textContent}
                onChange={setTextContent}
                bodyFontSize={bodyFontSize}
                onBodyFontSizeChange={setBodyFontSize}
                useGradientText={useGradientText}
                onUseGradientTextChange={setUseGradientText}
              />
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* 贴纸表情 */}
              <section id="emoji" className="soft-card p-6 scroll-mt-24 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                      <span className="text-xl">😊</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">添加贴纸</h2>
                      <p className="text-xs text-gray-600 mt-1">用可爱贴纸增添趣味</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">步骤 4/4</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">可选</span>
                  </div>
                </div>
                <EmojiPanel onEmojiSelect={handleEmojiAdd} />
              </section>

              {/* 操作提示 */}
              <div className="soft-card p-6 scroll-mt-24">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">💡</span>
                  </div>
                  <div className="text-sm">
                    <h3 className="font-bold text-gray-800 mb-3">操作小贴士</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                        选中贴纸后按 <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Delete</kbd> 键快速删除
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                        拖拽贴纸右下角缩放，右上角旋转
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                        点击导航栏快速跳转到对应功能
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：预览和导出区域 */}
          <div className="space-y-6 xl:sticky xl:top-6 self-start" id="preview">
            <div className="soft-card p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                    <span className="text-xl">👁️</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">实时预览</h2>
                    <p className="text-sm text-gray-600 mt-1">所见即所得的设计效果</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">实时预览</span>
              </div>
              <PreviewCanvas
                template={selectedTemplate}
                textContent={textContent}
                colorTheme={colorTheme}
                backgroundColor={backgroundColor}
                useGradientText={useGradientText}
                bodyFontSize={bodyFontSize}
                emojis={emojis}
                selectedEmojiId={selectedEmojiId}
                setSelectedEmojiId={setSelectedEmojiId}
                onEmojiUpdate={handleEmojiUpdate}
                onEmojiDelete={handleEmojiDelete}
              />
            </div>

            <div className="soft-card p-6 space-y-4">
              <div className="text-center mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-700 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">💾</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">导出封面</h2>
                <p className="text-sm text-gray-600">高清1080P图片，完美适配小红书</p>
              </div>
              
              <div className="space-y-4">
                <ExportButton
                  template={selectedTemplate}
                  textContent={textContent}
                  colorTheme={colorTheme}
                  backgroundColor={backgroundColor}
                  emojis={emojis}
                  bodyFontSize={bodyFontSize}
                  useGradientText={useGradientText}
                />
                
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                    <div className="text-lg font-semibold text-gray-800">1080×1440</div>
                    <div className="text-xs text-gray-600">输出尺寸</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                    <div className="text-lg font-semibold text-gray-800">PNG</div>
                    <div className="text-xs text-gray-600">图片格式</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Index
