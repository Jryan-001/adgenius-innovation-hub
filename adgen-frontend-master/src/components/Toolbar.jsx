import { Sparkles, Download } from 'lucide-react'

const Toolbar = ({ canvas }) => {
  const applyAIStyle = () => {
    if (!canvas) return

    canvas.setBackgroundColor('#fdf2f2', canvas.renderAll.bind(canvas))

    canvas.getObjects('i-text').forEach((obj) => {
      obj.set({
        fill: '#991b1b',
        fontFamily: 'Georgia',
      })
    })

    canvas.renderAll()
  }

  const exportPNG = () => {
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'adgen.png'
    link.href = canvas.toDataURL({ format: 'png', quality: 1 })
    link.click()
  }

  return (
    <div className="flex h-16 items-center justify-between border-b border-slate-700 bg-slate-800 px-6">
      <button
        onClick={applyAIStyle}
        className="flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 font-semibold"
      >
        <Sparkles size={18} /> AI Magic Layout
      </button>

      <button
        onClick={exportPNG}
        className="flex items-center gap-2 text-slate-300 hover:text-white"
      >
        <Download size={18} /> Export PNG
      </button>
    </div>
  )
}

export default Toolbar
