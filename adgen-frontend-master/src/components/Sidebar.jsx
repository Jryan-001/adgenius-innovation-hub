import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, PlusCircle, FolderOpen, Settings, User, Upload, X, Edit2, Trash2, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateProfile, darkMode, toggleDarkMode } = useAuth();
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const [showFilesPanel, setShowFilesPanel] = useState(false);
  const [showToolsPanel, setShowToolsPanel] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');

  // Projects stored in localStorage
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('adgen_projects');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Summer Sale Poster", date: "Today", thumbnail: "🎨", data: null },
      { id: 2, name: "Product Launch Ad", date: "Yesterday", thumbnail: "🚀", data: null },
      { id: 3, name: "Holiday Campaign", date: "Jan 1", thumbnail: "🎄", data: null },
    ];
  });

  // Save projects to localStorage
  useEffect(() => {
    localStorage.setItem('adgen_projects', JSON.stringify(projects));
  }, [projects]);

  const navItems = [
    { id: "home", icon: Home, label: "Home", action: () => { closeAllPanels(); navigate("/"); } },
    { id: "create", icon: PlusCircle, label: "Create", action: () => { closeAllPanels(); navigate("/create"); } },
    { id: "files", icon: FolderOpen, label: "Files", action: () => togglePanel('files') },
    { id: "tools", icon: Settings, label: "Tools", action: () => togglePanel('tools') },
    { id: "profile", icon: User, label: "Profile", action: () => togglePanel('profile') },
  ];

  const closeAllPanels = () => {
    setShowFilesPanel(false);
    setShowToolsPanel(false);
    setShowProfilePanel(false);
    setShowSettingsPanel(false);
  };

  const togglePanel = (panel) => {
    closeAllPanels();
    if (panel === 'files') setShowFilesPanel(true);
    if (panel === 'tools') setShowToolsPanel(true);
    if (panel === 'profile') setShowProfilePanel(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const newProject = {
        id: Date.now(),
        name: file.name.replace(/\.[^/.]+$/, ""),
        date: "Just now",
        thumbnail: "📄",
        data: null
      };
      setProjects(prev => [newProject, ...prev]);
    }
  };

  const handleOpenProject = (project) => {
    sessionStorage.setItem('openedProject', JSON.stringify(project));
    navigate("/editor");
    closeAllPanels();
  };

  const handleDeleteProject = (id) => {
    setProjects(prev => prev.filter(f => f.id !== id));
  };

  const handleRenameProject = (id, newName) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateProfile({ avatar: event.target?.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = () => {
    updateProfile({ name: newName });
    setEditingName(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Sidebar */}
      <aside className="w-20 bg-blue-700 flex flex-col items-center py-6 gap-4 z-20">
        {navItems.map(({ id, icon: Icon, label, action }) => {
          const isActive =
            (id === "home" && location.pathname === "/") ||
            (id === "create" && location.pathname === "/create") ||
            (id === "files" && showFilesPanel) ||
            (id === "tools" && showToolsPanel) ||
            (id === "profile" && showProfilePanel);

          return (
            <button
              key={id}
              onClick={action}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${isActive
                ? "bg-white text-blue-700"
                : "text-white/80 hover:bg-white/20"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </button>
          );
        })}
      </aside>

      {/* Files Panel */}
      {showFilesPanel && (
        <div className="fixed left-20 top-0 h-full w-80 bg-white shadow-xl z-10 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold text-gray-800">My Projects</h2>
            <button onClick={closeAllPanels} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Upload Button */}
          <div className="p-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              <Upload className="w-4 h-4" />
              New Project
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Project List */}
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => handleOpenProject(project)}
                onDelete={() => handleDeleteProject(project.id)}
                onRename={(name) => handleRenameProject(project.id, name)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tools Panel */}
      {showToolsPanel && (
        <div className="fixed left-20 top-0 h-full w-80 bg-white shadow-xl z-10 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold text-gray-800">Tools</h2>
            <button onClick={closeAllPanels} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <ToolCard
              icon="📋"
              title="Ad Templates"
              description="Start from pre-built templates"
              color="bg-rose-500"
              onClick={() => {
                sessionStorage.setItem('showTemplates', 'true');
                navigate("/editor");
                closeAllPanels();
              }}
            />
            <ToolCard
              icon="✨"
              title="AI Text Generator"
              description="Generate ad copy with AI"
              color="bg-purple-600"
              onClick={() => { navigate("/create"); closeAllPanels(); }}
            />
            <ToolCard
              icon="🎨"
              title="Canvas Editor"
              description="Design ads visually"
              color="bg-green-600"
              onClick={() => { navigate("/editor"); closeAllPanels(); }}
            />
            <ToolCard
              icon="✅"
              title="Compliance Checker"
              description="Check brand guidelines"
              color="bg-orange-500"
              onClick={() => { navigate("/editor"); closeAllPanels(); }}
            />
            <ToolCard
              icon="🖼️"
              title="AI Image Studio"
              description="Remove BG & generate assets"
              color="bg-blue-600"
              onClick={() => { navigate("/imagine"); closeAllPanels(); }}
            />
            <ToolCard
              icon="📤"
              title="Export Center"
              description="Download in multiple formats"
              color="bg-indigo-600"
              onClick={() => { navigate("/editor"); closeAllPanels(); }}
            />
          </div>
        </div>
      )}

      {/* Profile Panel */}
      {showProfilePanel && (
        <div className="fixed left-20 top-0 h-full w-80 bg-white shadow-xl z-10 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold text-gray-800">Profile</h2>
            <button onClick={closeAllPanels} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex-1 overflow-auto">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="w-24 h-24 rounded-full overflow-hidden cursor-pointer relative group"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Edit2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />

              {/* Name */}
              {editingName ? (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-3 py-1 border rounded-lg text-center"
                    autoFocus
                  />
                  <button onClick={handleSaveName} className="text-blue-600 font-semibold">Save</button>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-800">{user?.name}</h3>
                  <button onClick={() => { setEditingName(true); setNewName(user?.name || ''); }} className="text-gray-400 hover:text-gray-600">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">{projects.length}</p>
                <p className="text-xs text-gray-600">Projects</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <p className="text-2xl font-bold text-green-600">{user?.exports || 0}</p>
                <p className="text-xs text-gray-600">Exports</p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-3">
              <button
                onClick={() => { closeAllPanels(); setShowSettingsPanel(true); }}
                className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition flex items-center gap-3"
              >
                <span className="text-xl">⚙️</span>
                <span className="font-medium text-gray-700">Settings</span>
              </button>
              <button
                onClick={() => { closeAllPanels(); navigate('/brand-guidelines'); }}
                className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition flex items-center gap-3"
              >
                <span className="text-xl">🎨</span>
                <span className="font-medium text-gray-700">Brand Guidelines</span>
              </button>
              <button
                onClick={() => { closeAllPanels(); navigate('/usage'); }}
                className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition flex items-center gap-3"
              >
                <span className="text-xl">📊</span>
                <span className="font-medium text-gray-700">Usage & Billing</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left p-4 bg-red-50 rounded-xl hover:bg-red-100 transition flex items-center gap-3"
              >
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-600">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettingsPanel && (
        <div className="fixed left-20 top-0 h-full w-80 bg-white shadow-xl z-10 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold text-gray-800">Settings</h2>
            <button onClick={closeAllPanels} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Preferences</h3>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Dark Mode</span>
                <input
                  type="checkbox"
                  className="toggle"
                  checked={darkMode}
                  onChange={toggleDarkMode}
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mt-2">
                <span className="text-gray-600">Notifications</span>
                <input type="checkbox" defaultChecked className="toggle" />
              </label>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-3">AI Settings</h3>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Auto-apply suggestions</span>
                <input type="checkbox" defaultChecked className="toggle" />
              </label>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Export Settings</h3>
              <select className="w-full p-3 bg-gray-50 rounded-xl border-none">
                <option>PNG (High Quality)</option>
                <option>JPEG (Compressed)</option>
                <option>WebP (Modern)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      {(showFilesPanel || showToolsPanel || showProfilePanel || showSettingsPanel) && (
        <div
          className="fixed inset-0 bg-black/20 z-0"
          onClick={closeAllPanels}
        />
      )}
    </>
  );
}

// Helper Components
function ProjectCard({ project, onOpen, onDelete, onRename }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer group">
      <div
        className="flex-1 flex items-center gap-3"
        onClick={onOpen}
      >
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-2xl overflow-hidden">
          {project.thumbnail && project.thumbnail.startsWith('data:image') ? (
            <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
          ) : (
            project.thumbnail || '🎨'
          )}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => { onRename(name); setEditing(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { onRename(name); setEditing(false); } }}
              className="font-medium text-gray-800 w-full px-1 border rounded"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p className="font-medium text-gray-800 truncate">{project.name}</p>
          )}
          <p className="text-xs text-gray-500">{project.date}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={(e) => { e.stopPropagation(); setEditing(true); }}
          className="p-1 text-gray-400 hover:text-blue-600"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 text-gray-400 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ToolCard({ icon, title, description, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-4 ${color} text-white rounded-xl cursor-pointer hover:shadow-lg transition`}
    >
      <h3 className="font-semibold flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      <p className="text-sm opacity-90 mt-1">{description}</p>
    </div>
  );
}
