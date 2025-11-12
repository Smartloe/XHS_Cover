import React, { useState, useEffect } from 'react'
import TemplatePanel from '../components/TemplatePanel.jsx'
import TextEditor from '../components/TextEditor.jsx'
import ColorPanel from '../components/ColorPanel.jsx'
import EmojiPanel from '../components/EmojiPanel.jsx'
import PreviewCanvas from '../components/PreviewCanvas.jsx'
import ExportButton from '../components/ExportButton.jsx'

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
  const [bodyFontSize, setBodyFontSize] = useState(52)
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
        {/* 头部标题区域 - 重新设计 */}
        <div className="text-center mb-16 fade-in">
          <div className="relative inline-block mb-6">
            <h1 className="soft-title text-5xl md:text-6xl font-black mb-2 tracking-tight leading-tight">
              小红书封面生成器
            </h1>
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400/30 via-teal-400/30 to-cyan-400/30 rounded-2xl blur-xl -z-10 animate-pulse"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400/10 via-teal-400/10 to-cyan-400/10 rounded-xl -z-10"></div>
          </div>
          
          <p className="text-gray-700 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8 font-medium">
            🎨 专业级封面设计工具，让你的内容脱颖而出
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 rounded-full text-sm font-semibold border border-emerald-200 shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              AI智能设计
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 rounded-full text-sm font-semibold border border-blue-200 shadow-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              实时预览
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 rounded-full text-sm font-semibold border border-purple-200 shadow-sm">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
              一键导出
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-pink-50 text-pink-800 rounded-full text-sm font-semibold border border-pink-200 shadow-sm">
              <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
              高清输出
            </div>
          </div>
          
          {/* 统计数据展示 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center p-3 bg-white/60 backdrop-blur rounded-xl border border-white/80">
              <div className="text-2xl font-bold text-emerald-600">10+</div>
              <div className="text-xs text-gray-600 font-medium">精美模板</div>
            </div>
            <div className="text-center p-3 bg-white/60 backdrop-blur rounded-xl border border-white/80">
              <div className="text-2xl font-bold text-blue-600">100+</div>
              <div className="text-xs text-gray-600 font-medium">表情贴纸</div>
            </div>
            <div className="text-center p-3 bg-white/60 backdrop-blur rounded-xl border border-white/80">
              <div className="text-2xl font-bold text-purple-600">7</div>
              <div className="text-xs text-gray-600 font-medium">配色主题</div>
            </div>
            <div className="text-center p-3 bg-white/60 backdrop-blur rounded-xl border border-white/80">
              <div className="text-2xl font-bold text-pink-600">1080P</div>
              <div className="text-xs text-gray-600 font-medium">高清导出</div>
            </div>
          </div>
        </div>

        {/* 智能导航栏 - 全新设计 */}
        <div className="relative mb-12 slide-in">
          <div className="soft-card p-6 sticky top-4 z-30 backdrop-blur border border-white/80 shadow-2xl">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-1">创作流程</h3>
              <p className="text-sm text-gray-600">按步骤完成你的封面设计</p>
            </div>
            
            <nav className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { id: 'template', name: '选择模板', icon: '🎨', color: 'emerald', step: '1' },
                { id: 'editor', name: '编辑文案', icon: '✏️', color: 'blue', step: '2' },
                { id: 'emoji', name: '添加贴纸', icon: '😊', color: 'yellow', step: '3' },
                { id: 'color', name: '调整配色', icon: '🌈', color: 'purple', step: '4' },
                { id: 'preview', name: '预览导出', icon: '👁️', color: 'indigo', step: '5' }
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`relative group flex flex-col items-center gap-2 p-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl ripple-effect border-2 border-transparent
                    ${item.color === 'emerald' ? 'text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200' :
                      item.color === 'blue' ? 'text-blue-700 hover:bg-blue-50 hover:border-blue-200' :
                      item.color === 'yellow' ? 'text-yellow-700 hover:bg-yellow-50 hover:border-yellow-200' :
                      item.color === 'purple' ? 'text-purple-700 hover:bg-purple-50 hover:border-purple-200' :
                      'text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200'}`}
                >
                  {/* 步骤编号 */}
                  <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white shadow-lg
                    ${item.color === 'emerald' ? 'bg-emerald-500' :
                      item.color === 'blue' ? 'bg-blue-500' :
                      item.color === 'yellow' ? 'bg-yellow-500' :
                      item.color === 'purple' ? 'bg-purple-500' :
                      'bg-indigo-500'}`}>
                    {item.step}
                  </div>
                  
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                  <span className="text-sm font-bold text-center leading-tight">{item.name}</span>
                </a>
              ))}
            </nav>
            
            {/* 进度指示器 */}
            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map((step, index) => (
                  <React.Fragment key={step}>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    {index < 4 && <div className="w-8 h-0.5 bg-gray-200"></div>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* 主要内容区域 - 全新布局 */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10">
          {/* 左侧：功能面板区域 */}
          <div className="xl:col-span-8 space-y-10">
            {/* 模板选择 - 重新设计 */}
            <section id="template" className="soft-card p-8 scroll-mt-24 hover:shadow-2xl transition-all duration-500 border-l-4 border-emerald-400">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">🎨</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">选择模板</h2>
                    <p className="text-sm text-gray-600 mt-1">从精美模板开始你的设计</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                    步骤 1/5
                  </span>
                </div>
              </div>
              <TemplatePanel
                onTemplateSelect={handleTemplateSelect}
                selectedTemplate={selectedTemplate}
              />
            </section>

            {/* 文案编辑 - 重新设计 */}
            <section id="editor" className="soft-card p-8 scroll-mt-24 hover:shadow-2xl transition-all duration-500 border-l-4 border-blue-400">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">✏️</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">编辑文案</h2>
                    <p className="text-sm text-gray-600 mt-1">打造吸引眼球的标题和内容</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
                    步骤 2/5
                  </span>
                </div>
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

            {/* 贴纸表情 - 重新设计 */}
            <section id="emoji" className="soft-card p-8 scroll-mt-24 hover:shadow-2xl transition-all duration-500 border-l-4 border-yellow-400">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">😊</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">添加贴纸</h2>
                    <p className="text-sm text-gray-600 mt-1">用可爱贴纸为封面增添趣味</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200">
                    步骤 3/5
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">可选</span>
                </div>
              </div>
              <EmojiPanel onEmojiSelect={handleEmojiAdd} />
            </section>

            {/* 配色背景 - 重新设计 */}
            <section id="color" className="soft-card p-8 scroll-mt-24 hover:shadow-2xl transition-all duration-500 border-l-4 border-purple-400">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">🌈</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">配色方案</h2>
                    <p className="text-sm text-gray-600 mt-1">选择完美的色彩搭配</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
                    步骤 4/5
                  </span>
                </div>
              </div>
              <ColorPanel
                theme={colorTheme}
                onThemeChange={setColorTheme}
                backgroundColor={backgroundColor}
                onBackgroundColorChange={setBackgroundColor}
              />
            </section>
          </div>

          {/* 右侧：预览和导出区域 - 重新设计 */}
          <div className="xl:col-span-4">
            <div id="preview" className="sticky top-24 space-y-8 scroll-mt-24">
              {/* 预览卡片 - 增强设计 */}
              <div className="soft-card p-8 hover:shadow-2xl transition-all duration-500 border-l-4 border-indigo-400">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl">👁️</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">实时预览</h2>
                      <p className="text-sm text-gray-600 mt-1">所见即所得的设计效果</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
                      步骤 5/5
                    </span>
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full animate-pulse border border-emerald-200">
                      实时更新
                    </span>
                  </div>
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

              {/* 导出按钮区域 - 增强设计 */}
              <div className="soft-card p-8 hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center shadow-xl mx-auto mb-4">
                    <span className="text-white text-2xl">💾</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">导出封面</h2>
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
                  
                  {/* 导出规格说明 */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white/80 rounded-xl p-3 border border-green-200">
                      <div className="text-lg font-bold text-green-600">1080×1440</div>
                      <div className="text-xs text-gray-600">输出尺寸</div>
                    </div>
                    <div className="bg-white/80 rounded-xl p-3 border border-green-200">
                      <div className="text-lg font-bold text-green-600">PNG</div>
                      <div className="text-xs text-gray-600">图片格式</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 快捷操作提示 - 重新设计 */}
              <div className="soft-card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white text-lg">💡</span>
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
        </div>
      </div>
    </div>
  )
}

export default Index
