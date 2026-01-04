import { useState } from 'react'
import Sidebar from './components/Sidebar'
import CanvasEditor from './components/CanvasEditor'
import Toolbar from './components/Toolbar'

function App() {
  const [canvas, setCanvas] = useState(null)

  return (
    <div className="flex h-screen w-full bg-slate-900 text-white">
      <Sidebar canvas={canvas} />

      <div className="flex flex-1 flex-col">
        <Toolbar canvas={canvas} />

        <main className="flex flex-1 items-center justify-center p-6">
          <CanvasEditor onCanvasReady={setCanvas} />
        </main>
      </div>
    </div>
  )
}

export default App
