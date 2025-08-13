import React, { useState, useEffect } from 'react';
import { Upload, Image, Video, Globe, Users, Settings, Bitcoin, Zap, Calendar, Star, AlertCircle, CheckCircle, X, Plus, Trash2 } from 'lucide-react';

interface GamePublishingFormProps {
  onSubmit: (gameData: any) => void;
  onCancel: () => void;
  user: any;
}

const GamePublishingForm: React.FC<GamePublishingFormProps> = ({ onSubmit, onCancel, user }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    shortDescription: '',
    longDescription: '',
    
    // Developer/Publisher Info
    developerCompanyId: '',
    publisherCompanyId: '',
    franchise: '',
    
    // Release Info
    releaseType: 'full_release', // coming_soon, early_access, full_release
    releaseDate: '',
    earlyAccess: false,
    comingSoon: false,
    
    // Pricing
    priceUsd: 0,
    priceBtc: 0,
    priceSats: 0,
    freeToPlay: false,
    
    // Categories & Tags
    genres: [],
    tags: [],
    categories: [],
    
    // Content Rating
    contentRating: 'everyone',
    matureContent: false,
    matureContentDescription: '',
    
    // Media
    headerImage: '',
    screenshots: [''],
    trailers: [''],
    logo: '',
    
    // Technical Info
    platforms: ['windows'],
    languages: ['english'],
    systemRequirements: {
      windows: { minimum: '', recommended: '' },
      mac: { minimum: '', recommended: '' },
      linux: { minimum: '', recommended: '' }
    },
    fileSize: '',
    
    // Features
    singlePlayer: true,
    multiPlayer: false,
    coop: false,
    pvp: false,
    onlinePlay: false,
    localPlay: false,
    crossPlatform: false,
    
    // Steam-like Features
    cloudSaves: false,
    tradingCards: false,
    workshopSupport: false,
    achievementsCount: 0,
    leaderboards: false,
    
    // Controllers
    supportedControllers: [],
    
    // DRM & Legal
    drmNotice: '',
    copyrightNotice: '',
    
    // Additional
    websiteUrl: '',
    supportUrl: '',
    privacyPolicyUrl: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user's companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // In a real app, this would fetch from API
        const mockCompanies = [
          { id: '1', name: 'My Game Studio', type: 'developer' },
          { id: '2', name: 'Indie Publisher Co', type: 'publisher' }
        ];
        setCompanies(mockCompanies);
      } catch (error) {
        console.error('Failed to fetch companies:', error);
      }
    };
    fetchCompanies();
  }, []);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addArrayItem = (field: string, defaultValue: string = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field as keyof typeof prev] as string[], defaultValue]
    }));
  };

  const updateArrayItem = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Basic Info
        if (!formData.title.trim()) newErrors.title = 'Game title is required';
        if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
        if (formData.shortDescription.length > 300) newErrors.shortDescription = 'Short description must be under 300 characters';
        if (!formData.longDescription.trim()) newErrors.longDescription = 'Detailed description is required';
        break;

      case 2: // Developer/Publisher
        if (!formData.developerCompanyId) newErrors.developerCompanyId = 'Developer is required';
        break;

      case 3: // Pricing & Release
        if (!formData.freeToPlay && formData.priceUsd <= 0) {
          newErrors.priceUsd = 'Price is required for paid games';
        }
        if (formData.releaseType === 'coming_soon' && !formData.releaseDate) {
          newErrors.releaseDate = 'Release date is required for coming soon games';
        }
        break;

      case 4: // Categories & Content
        if (formData.genres.length === 0) newErrors.genres = 'At least one genre is required';
        if (formData.matureContent && !formData.matureContentDescription.trim()) {
          newErrors.matureContentDescription = 'Mature content description is required';
        }
        break;

      case 5: // Media & Assets
        if (!formData.headerImage.trim()) newErrors.headerImage = 'Header image is required';
        if (formData.screenshots.filter(s => s.trim()).length < 1) {
          newErrors.screenshots = 'At least one screenshot is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to submit game:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4, 5].map(step => (
        <div key={step} className={`step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
          <div className="step-number">
            {currentStep > step ? <CheckCircle size={16} /> : step}
          </div>
          <div className="step-label">
            {step === 1 && 'Basic Info'}
            {step === 2 && 'Developer'}
            {step === 3 && 'Pricing'}
            {step === 4 && 'Categories'}
            {step === 5 && 'Media'}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="game-publishing-form">
      <div className="publishing-header">
        <h1>🎮 Publish Your Game</h1>
        <p>Get your game on the Bitcoin Gaming Marketplace</p>
        {renderStepIndicator()}
      </div>

      <div className="publishing-content">
        {currentStep === 1 && (
          <div className="step-content">
            <h2>📝 Basic Game Information</h2>
            
            <div className="form-group">
              <label>Game Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder="Enter your game's title"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label>Short Description * (appears in search results)</label>
              <textarea
                value={formData.shortDescription}
                onChange={(e) => updateFormData('shortDescription', e.target.value)}
                placeholder="Brief description of your game (max 300 characters)"
                rows={3}
                maxLength={300}
                className={errors.shortDescription ? 'error' : ''}
              />
              <small>{formData.shortDescription.length}/300 characters</small>
              {errors.shortDescription && <span className="error-message">{errors.shortDescription}</span>}
            </div>

            <div className="form-group">
              <label>Detailed Description *</label>
              <textarea
                value={formData.longDescription}
                onChange={(e) => updateFormData('longDescription', e.target.value)}
                placeholder="Detailed description of your game, features, gameplay, story..."
                rows={8}
                className={errors.longDescription ? 'error' : ''}
              />
              {errors.longDescription && <span className="error-message">{errors.longDescription}</span>}
            </div>

            <div className="form-group">
              <label>Website URL</label>
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => updateFormData('websiteUrl', e.target.value)}
                placeholder="https://yourgame.com"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="step-content">
            <h2>🏢 Developer & Publisher</h2>

            <div className="form-group">
              <label>Developer *</label>
              <select
                value={formData.developerCompanyId}
                onChange={(e) => updateFormData('developerCompanyId', e.target.value)}
                className={errors.developerCompanyId ? 'error' : ''}
              >
                <option value="">Select developer</option>
                {companies.filter(c => c.type === 'developer' || c.type === 'both').map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
              {errors.developerCompanyId && <span className="error-message">{errors.developerCompanyId}</span>}
            </div>

            <div className="form-group">
              <label>Publisher (optional)</label>
              <select
                value={formData.publisherCompanyId}
                onChange={(e) => updateFormData('publisherCompanyId', e.target.value)}
              >
                <option value="">Same as developer</option>
                {companies.filter(c => c.type === 'publisher' || c.type === 'both').map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Franchise (optional)</label>
              <input
                type="text"
                value={formData.franchise}
                onChange={(e) => updateFormData('franchise', e.target.value)}
                placeholder="e.g., Call of Duty, Final Fantasy"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="step-content">
            <h2>💰 Pricing & Release</h2>

            <div className="form-group">
              <label>Release Type</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    value="full_release"
                    checked={formData.releaseType === 'full_release'}
                    onChange={(e) => updateFormData('releaseType', e.target.value)}
                  />
                  <span>Full Release</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    value="early_access"
                    checked={formData.releaseType === 'early_access'}
                    onChange={(e) => updateFormData('releaseType', e.target.value)}
                  />
                  <span>Early Access</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    value="coming_soon"
                    checked={formData.releaseType === 'coming_soon'}
                    onChange={(e) => updateFormData('releaseType', e.target.value)}
                  />
                  <span>Coming Soon</span>
                </label>
              </div>
            </div>

            {formData.releaseType === 'coming_soon' && (
              <div className="form-group">
                <label>Expected Release Date *</label>
                <input
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => updateFormData('releaseDate', e.target.value)}
                  className={errors.releaseDate ? 'error' : ''}
                />
                {errors.releaseDate && <span className="error-message">{errors.releaseDate}</span>}
              </div>
            )}

            <div className="pricing-section">
              <div className="form-group">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.freeToPlay}
                    onChange={(e) => updateFormData('freeToPlay', e.target.checked)}
                  />
                  <span>Free to Play</span>
                </label>
              </div>

              {!formData.freeToPlay && (
                <div className="pricing-grid">
                  <div className="form-group">
                    <label>Price (USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.priceUsd}
                      onChange={(e) => updateFormData('priceUsd', parseFloat(e.target.value) || 0)}
                      className={errors.priceUsd ? 'error' : ''}
                    />
                    {errors.priceUsd && <span className="error-message">{errors.priceUsd}</span>}
                  </div>

                  <div className="form-group">
                    <label>Price (BTC)</label>
                    <input
                      type="number"
                      step="0.00000001"
                      min="0"
                      value={formData.priceBtc}
                      onChange={(e) => updateFormData('priceBtc', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Price (Satoshis)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.priceSats}
                      onChange={(e) => updateFormData('priceSats', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="step-content">
            <h2>🎯 Categories & Content</h2>

            <div className="form-group">
              <label>Genres * (select up to 3)</label>
              <div className="checkbox-grid">
                {['Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Puzzle', 'Racing', 'Sports', 'Fighting', 'Platformer', 'Shooter', 'Horror', 'Casual', 'Indie', 'Educational'].map(genre => (
                  <label key={genre} className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={formData.genres.includes(genre)}
                      onChange={(e) => {
                        if (e.target.checked && formData.genres.length < 3) {
                          updateFormData('genres', [...formData.genres, genre]);
                        } else if (!e.target.checked) {
                          updateFormData('genres', formData.genres.filter(g => g !== genre));
                        }
                      }}
                      disabled={!formData.genres.includes(genre) && formData.genres.length >= 3}
                    />
                    <span>{genre}</span>
                  </label>
                ))}
              </div>
              {errors.genres && <span className="error-message">{errors.genres}</span>}
            </div>

            <div className="form-group">
              <label>Tags (help players find your game)</label>
              <div className="tags-input">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="tag-item">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => updateArrayItem('tags', index, e.target.value)}
                      placeholder="Enter tag"
                    />
                    <button type="button" onClick={() => removeArrayItem('tags', index)}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" className="add-tag-btn" onClick={() => addArrayItem('tags')}>
                  <Plus size={16} />
                  Add Tag
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Content Rating</label>
              <select
                value={formData.contentRating}
                onChange={(e) => updateFormData('contentRating', e.target.value)}
              >
                <option value="everyone">Everyone (E)</option>
                <option value="teen">Teen (T)</option>
                <option value="mature">Mature 17+ (M)</option>
                <option value="adults_only">Adults Only 18+ (AO)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={formData.matureContent}
                  onChange={(e) => updateFormData('matureContent', e.target.checked)}
                />
                <span>This game contains mature content</span>
              </label>
            </div>

            {formData.matureContent && (
              <div className="form-group">
                <label>Mature Content Description *</label>
                <textarea
                  value={formData.matureContentDescription}
                  onChange={(e) => updateFormData('matureContentDescription', e.target.value)}
                  placeholder="Describe the mature content (violence, language, sexual themes, etc.)"
                  rows={3}
                  className={errors.matureContentDescription ? 'error' : ''}
                />
                {errors.matureContentDescription && <span className="error-message">{errors.matureContentDescription}</span>}
              </div>
            )}

            <div className="form-group">
              <label>Supported Platforms</label>
              <div className="checkbox-group">
                {['windows', 'mac', 'linux'].map(platform => (
                  <label key={platform} className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={formData.platforms.includes(platform)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData('platforms', [...formData.platforms, platform]);
                        } else {
                          updateFormData('platforms', formData.platforms.filter(p => p !== platform));
                        }
                      }}
                    />
                    <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="step-content">
            <h2>🖼️ Media & Assets</h2>

            <div className="form-group">
              <label>Header Image * (460x215 pixels)</label>
              <div className="file-upload">
                <input
                  type="url"
                  value={formData.headerImage}
                  onChange={(e) => updateFormData('headerImage', e.target.value)}
                  placeholder="https://example.com/header-image.jpg"
                  className={errors.headerImage ? 'error' : ''}
                />
                <button type="button" className="upload-btn">
                  <Upload size={16} />
                  Upload Image
                </button>
              </div>
              {errors.headerImage && <span className="error-message">{errors.headerImage}</span>}
            </div>

            <div className="form-group">
              <label>Screenshots * (at least 1)</label>
              <div className="screenshots-list">
                {formData.screenshots.map((screenshot, index) => (
                  <div key={index} className="screenshot-item">
                    <input
                      type="url"
                      value={screenshot}
                      onChange={(e) => updateArrayItem('screenshots', index, e.target.value)}
                      placeholder="https://example.com/screenshot.jpg"
                    />
                    <button type="button" className="upload-btn">
                      <Upload size={16} />
                    </button>
                    {formData.screenshots.length > 1 && (
                      <button type="button" onClick={() => removeArrayItem('screenshots', index)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                {formData.screenshots.length < 10 && (
                  <button type="button" className="add-item-btn" onClick={() => addArrayItem('screenshots')}>
                    <Plus size={16} />
                    Add Screenshot
                  </button>
                )}
              </div>
              {errors.screenshots && <span className="error-message">{errors.screenshots}</span>}
            </div>

            <div className="form-group">
              <label>Trailers (optional)</label>
              <div className="trailers-list">
                {formData.trailers.map((trailer, index) => (
                  <div key={index} className="trailer-item">
                    <input
                      type="url"
                      value={trailer}
                      onChange={(e) => updateArrayItem('trailers', index, e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    <button type="button" onClick={() => removeArrayItem('trailers', index)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" className="add-item-btn" onClick={() => addArrayItem('trailers')}>
                  <Plus size={16} />
                  Add Trailer
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Game Logo (optional)</label>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => updateFormData('logo', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="form-group">
              <label>File Size</label>
              <input
                type="text"
                value={formData.fileSize}
                onChange={(e) => updateFormData('fileSize', e.target.value)}
                placeholder="e.g., 2.5 GB"
              />
            </div>
          </div>
        )}
      </div>

      <div className="publishing-actions">
        {currentStep > 1 && (
          <button className="btn-secondary" onClick={prevStep}>
            Previous
          </button>
        )}
        
        <button className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        
        <div className="spacer" />
        
        {currentStep < 5 ? (
          <button className="btn-primary" onClick={nextStep}>
            Next
          </button>
        ) : (
          <button 
            className="btn-primary" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Publishing...' : 'Publish Game'}
          </button>
        )}
      </div>
    </div>
  );
};

export default GamePublishingForm;
