import { useState, useRef } from 'react';
import type { Character } from '../types';

interface AddCharacterModalProps {
  isOpen: boolean;
  editingCharacter: Character | null;
  onClose: () => void;
  onSave: (character: Omit<Character, 'id' | 'updatedAt' | 'source'>) => void;
}

const GAMES = [
  { id: 'genshin', name: '原神', color: '#4a90e2' },
  { id: 'hsr', name: '星穹铁道', color: '#6b5ce7' },
  { id: 'zzz', name: '绝区零', color: '#ff6b6b' },
  { id: 'honkai3', name: '崩坏3', color: '#ff8cc8' },
];

const AddCharacterModal = ({ isOpen, editingCharacter, onClose, onSave }: AddCharacterModalProps) => {
  const [formData, setFormData] = useState({
    name: editingCharacter?.name || '',
    nameEn: editingCharacter?.nameEn || '',
    game: editingCharacter?.game || 'genshin',
    birthday: editingCharacter?.birthday || '01-01',
    avatar: editingCharacter?.avatar || '',
    rarity: editingCharacter?.rarity || 4,
    element: editingCharacter?.element || '',
    weapon: editingCharacter?.weapon || '',
    region: editingCharacter?.region || '',
  });
  
  const [previewUrl, setPreviewUrl] = useState(editingCharacter?.avatar || '');
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');
  const [jsonInput, setJsonInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'avatar') {
      setPreviewUrl(value as string);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData(prev => ({ ...prev, avatar: base64 }));
        setPreviewUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.birthday) {
      alert('请填写角色名称和生日');
      return;
    }
    onSave(formData);
    onClose();
  };

  const handleJsonImport = () => {
    try {
      const data = JSON.parse(jsonInput);
      if (Array.isArray(data)) {
        data.forEach((char: any) => {
          onSave({
            name: char.name || char.nameCn || '',
            nameEn: char.nameEn || char.name || '',
            game: char.game || 'genshin',
            birthday: char.birthday || '01-01',
            avatar: char.avatar || '',
            rarity: char.rarity || 4,
            element: char.element || '',
            weapon: char.weapon || '',
            region: char.region || '',
          });
        });
      } else {
        onSave({
          name: data.name || data.nameCn || '',
          nameEn: data.nameEn || data.name || '',
          game: data.game || 'genshin',
          birthday: data.birthday || '01-01',
          avatar: data.avatar || '',
          rarity: data.rarity || 4,
          element: data.element || '',
          weapon: data.weapon || '',
          region: data.region || '',
        });
      }
      setJsonInput('');
      onClose();
    } catch {
      alert('JSON格式错误，请检查');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-character-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <h2>{editingCharacter ? '编辑角色' : '添加新角色'}</h2>
        </div>
        
        <div className="modal-body">
          <div className="tab-switcher">
            <button 
              className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
              onClick={() => setActiveTab('form')}
            >
              表单
            </button>
            <button 
              className={`tab-btn ${activeTab === 'json' ? 'active' : ''}`}
              onClick={() => setActiveTab('json')}
            >
              JSON导入
            </button>
          </div>
          
          {activeTab === 'form' ? (
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>角色名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="如：芙宁娜"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>英文名</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={e => handleChange('nameEn', e.target.value)}
                    placeholder="如：Furina"
                  />
                </div>
                
                <div className="form-group">
                  <label>所属游戏 *</label>
                  <select 
                    value={formData.game} 
                    onChange={e => handleChange('game', e.target.value)}
                  >
                    {GAMES.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>生日 (MM-DD) *</label>
                  <input
                    type="text"
                    value={formData.birthday}
                    onChange={e => handleChange('birthday', e.target.value)}
                    placeholder="如：10-13"
                    pattern="\d{2}-\d{2}"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>稀有度</label>
                  <select 
                    value={formData.rarity} 
                    onChange={e => handleChange('rarity', parseInt(e.target.value))}
                  >
                    <option value={3}>3星</option>
                    <option value={4}>4星</option>
                    <option value={5}>5星</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>元素/属性</label>
                  <input
                    type="text"
                    value={formData.element}
                    onChange={e => handleChange('element', e.target.value)}
                    placeholder="如：水"
                  />
                </div>
                
                <div className="form-group">
                  <label>武器类型</label>
                  <input
                    type="text"
                    value={formData.weapon}
                    onChange={e => handleChange('weapon', e.target.value)}
                    placeholder="如：单手剑"
                  />
                </div>
                
                <div className="form-group">
                  <label>地区</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={e => handleChange('region', e.target.value)}
                    placeholder="如：枫丹"
                  />
                </div>
              </div>
              
              <div className="form-group avatar-section">
                <label>角色头像/立绘</label>
                <div className="avatar-input-row">
                  <input
                    type="text"
                    value={formData.avatar}
                    onChange={e => handleChange('avatar', e.target.value)}
                    placeholder="输入图片URL，或上传本地图片"
                    className="avatar-url-input"
                  />
                  <button 
                    type="button" 
                    className="upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    📁 上传
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </div>
                
                {previewUrl && (
                  <div className="avatar-preview">
                    <img src={previewUrl} alt="预览" />
                    <p>预览</p>
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onClose}>取消</button>
                <button type="submit" className="btn-primary">{editingCharacter ? '保存修改' : '添加角色'}</button>
              </div>
            </form>
          ) : (
            <div className="json-import-section">
              <textarea
                value={jsonInput}
                onChange={e => setJsonInput(e.target.value)}
                placeholder={`支持单条或数组格式：
{
  "name": "角色名",
  "nameEn": "Name",
  "game": "genshin",
  "birthday": "01-01",
  "avatar": "https://...",
  "rarity": 5,
  "element": "火",
  "weapon": "单手剑",
  "region": "蒙德"
}`}
                rows={12}
              />
              <div className="form-actions">
                <button className="btn-secondary" onClick={onClose}>取消</button>
                <button className="btn-primary" onClick={handleJsonImport}>导入</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCharacterModal;
