import React, { useState } from 'react';
import { User, Building, Globe, Bitcoin, Zap, Upload, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface DeveloperOnboardingProps {
  onComplete: (applicationData: any) => void;
  onCancel: () => void;
}

const DeveloperOnboarding: React.FC<DeveloperOnboardingProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Account Type
    applicationType: 'individual',
    
    // Personal/Company Info
    fullName: '',
    companyName: '',
    businessType: '',
    taxId: '',
    
    // Contact Info
    email: '',
    phone: '',
    website: '',
    
    // Address
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: '',
    
    // Bitcoin/Lightning
    bitcoinAddress: '',
    lightningAddress: '',
    preferredPayoutMethod: 'bitcoin',
    
    // Development Experience
    developmentExperience: 'intermediate',
    previousGames: [''],
    gameEngines: [''],
    targetPlatforms: ['windows'],
    
    // First Game Info
    firstGameTitle: '',
    firstGameDescription: '',
    firstGameGenre: '',
    estimatedReleaseDate: '',
    
    // Marketing
    marketingBudgetUsd: 0,
    socialMediaLinks: {
      twitter: '',
      discord: '',
      youtube: '',
      website: ''
    },
    pressKitUrl: '',
    
    // Legal
    agreesToTerms: false,
    agreesToRevenueShare: false,
    contentRatingAcknowledgment: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Account Type & Basic Info
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (formData.applicationType === 'company' && !formData.companyName.trim()) {
          newErrors.companyName = 'Company name is required';
        }
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email';
        }
        break;

      case 2: // Address & Contact
        if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.country.trim()) newErrors.country = 'Country is required';
        break;

      case 3: // Bitcoin/Lightning Setup
        if (!formData.bitcoinAddress.trim() && !formData.lightningAddress.trim()) {
          newErrors.bitcoinAddress = 'At least one Bitcoin or Lightning address is required';
        }
        break;

      case 4: // Development Experience
        if (!formData.firstGameTitle.trim()) newErrors.firstGameTitle = 'First game title is required';
        if (!formData.firstGameDescription.trim()) newErrors.firstGameDescription = 'Game description is required';
        break;

      case 5: // Legal & Terms
        if (!formData.agreesToTerms) newErrors.agreesToTerms = 'You must agree to the terms';
        if (!formData.agreesToRevenueShare) newErrors.agreesToRevenueShare = 'You must agree to the revenue share';
        if (!formData.contentRatingAcknowledgment) newErrors.contentRatingAcknowledgment = 'You must acknowledge content rating requirements';
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
      // Here we would submit to the API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setCurrentStep(6); // Success step
      setTimeout(() => {
        onComplete(formData);
      }, 3000);
    } catch (error) {
      console.error('Failed to submit application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field as keyof typeof prev] as string[], '']
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

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4, 5].map(step => (
        <div key={step} className={`step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
          <div className="step-number">
            {currentStep > step ? <CheckCircle size={16} /> : step}
          </div>
          <div className="step-label">
            {step === 1 && 'Basic Info'}
            {step === 2 && 'Address'}
            {step === 3 && 'Bitcoin Setup'}
            {step === 4 && 'Experience'}
            {step === 5 && 'Legal'}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="developer-onboarding">
      <div className="onboarding-header">
        <h1>🎮⚡ Join Bitcoin Gaming Marketplace</h1>
        <p>Start earning Bitcoin from your games today!</p>
        {currentStep < 6 && renderStepIndicator()}
      </div>

      <div className="onboarding-content">
        {currentStep === 1 && (
          <div className="step-content">
            <h2><User size={24} /> Account Information</h2>
            <p>Tell us about yourself or your company</p>

            <div className="form-group">
              <label>Application Type</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    value="individual"
                    checked={formData.applicationType === 'individual'}
                    onChange={(e) => updateFormData('applicationType', e.target.value)}
                  />
                  <span>Individual Developer</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    value="company"
                    checked={formData.applicationType === 'company'}
                    onChange={(e) => updateFormData('applicationType', e.target.value)}
                  />
                  <span>Company/Studio</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => updateFormData('fullName', e.target.value)}
                placeholder="Your full legal name"
                className={errors.fullName ? 'error' : ''}
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            {formData.applicationType === 'company' && (
              <>
                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => updateFormData('companyName', e.target.value)}
                    placeholder="Your company or studio name"
                    className={errors.companyName ? 'error' : ''}
                  />
                  {errors.companyName && <span className="error-message">{errors.companyName}</span>}
                </div>

                <div className="form-group">
                  <label>Business Type</label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => updateFormData('businessType', e.target.value)}
                  >
                    <option value="">Select business type</option>
                    <option value="llc">LLC</option>
                    <option value="corporation">Corporation</option>
                    <option value="partnership">Partnership</option>
                    <option value="sole_proprietorship">Sole Proprietorship</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="your@email.com"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => updateFormData('website', e.target.value)}
                placeholder="https://yourstudio.com"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="step-content">
            <h2><Building size={24} /> Address & Contact Information</h2>
            <p>We need your address for tax and payment purposes</p>

            <div className="form-group">
              <label>Address Line 1 *</label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => updateFormData('addressLine1', e.target.value)}
                placeholder="123 Main Street"
                className={errors.addressLine1 ? 'error' : ''}
              />
              {errors.addressLine1 && <span className="error-message">{errors.addressLine1}</span>}
            </div>

            <div className="form-group">
              <label>Address Line 2</label>
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) => updateFormData('addressLine2', e.target.value)}
                placeholder="Apartment, suite, etc."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  placeholder="San Francisco"
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="error-message">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label>State/Province</label>
                <input
                  type="text"
                  value={formData.stateProvince}
                  onChange={(e) => updateFormData('stateProvince', e.target.value)}
                  placeholder="California"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => updateFormData('postalCode', e.target.value)}
                  placeholder="94102"
                />
              </div>

              <div className="form-group">
                <label>Country *</label>
                <select
                  value={formData.country}
                  onChange={(e) => updateFormData('country', e.target.value)}
                  className={errors.country ? 'error' : ''}
                >
                  <option value="">Select country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="JP">Japan</option>
                  <option value="AU">Australia</option>
                  <option value="other">Other</option>
                </select>
                {errors.country && <span className="error-message">{errors.country}</span>}
              </div>
            </div>

            {formData.applicationType === 'company' && (
              <div className="form-group">
                <label>Tax ID / EIN</label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => updateFormData('taxId', e.target.value)}
                  placeholder="12-3456789"
                />
                <small>Required for tax reporting and payments</small>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="step-content">
            <h2><Bitcoin size={24} /> Bitcoin & Lightning Setup</h2>
            <p>Configure how you want to receive Bitcoin payments</p>

            <div className="bitcoin-benefits">
              <h3>🚀 Why Bitcoin Payments?</h3>
              <ul>
                <li>⚡ <strong>Instant settlements</strong> - Get paid immediately, not in 30-60 days</li>
                <li>🌍 <strong>Global reach</strong> - No geographic restrictions or currency conversions</li>
                <li>💰 <strong>Lower fees</strong> - 1-3% vs traditional 5-15% payment processor fees</li>
                <li>🔒 <strong>No chargebacks</strong> - Bitcoin transactions are final and secure</li>
                <li>📈 <strong>Potential appreciation</strong> - Hold Bitcoin as it potentially grows in value</li>
              </ul>
            </div>

            <div className="form-group">
              <label>Preferred Payout Method</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    value="bitcoin"
                    checked={formData.preferredPayoutMethod === 'bitcoin'}
                    onChange={(e) => updateFormData('preferredPayoutMethod', e.target.value)}
                  />
                  <span><Bitcoin size={16} /> Bitcoin (On-chain)</span>
                  <small>Best for larger amounts, takes 10-60 minutes</small>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    value="lightning"
                    checked={formData.preferredPayoutMethod === 'lightning'}
                    onChange={(e) => updateFormData('preferredPayoutMethod', e.target.value)}
                  />
                  <span><Zap size={16} /> Lightning Network</span>
                  <small>Instant payments, perfect for smaller amounts</small>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    value="both"
                    checked={formData.preferredPayoutMethod === 'both'}
                    onChange={(e) => updateFormData('preferredPayoutMethod', e.target.value)}
                  />
                  <span>Both (Recommended)</span>
                  <small>We'll choose the best method based on amount</small>
                </label>
              </div>
            </div>

            {(formData.preferredPayoutMethod === 'bitcoin' || formData.preferredPayoutMethod === 'both') && (
              <div className="form-group">
                <label>Bitcoin Address</label>
                <input
                  type="text"
                  value={formData.bitcoinAddress}
                  onChange={(e) => updateFormData('bitcoinAddress', e.target.value)}
                  placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                  className={errors.bitcoinAddress ? 'error' : ''}
                />
                <small>Your Bitcoin wallet address for receiving payments</small>
                {errors.bitcoinAddress && <span className="error-message">{errors.bitcoinAddress}</span>}
              </div>
            )}

            {(formData.preferredPayoutMethod === 'lightning' || formData.preferredPayoutMethod === 'both') && (
              <div className="form-group">
                <label>Lightning Address</label>
                <input
                  type="text"
                  value={formData.lightningAddress}
                  onChange={(e) => updateFormData('lightningAddress', e.target.value)}
                  placeholder="developer@getalby.com or LNURL..."
                  className={errors.lightningAddress ? 'error' : ''}
                />
                <small>Your Lightning address or LNURL for instant payments</small>
              </div>
            )}

            <div className="wallet-recommendations">
              <h4>🔧 Recommended Wallets</h4>
              <div className="wallet-grid">
                <div className="wallet-option">
                  <strong>Alby</strong>
                  <p>Easy Lightning address: you@getalby.com</p>
                </div>
                <div className="wallet-option">
                  <strong>Strike</strong>
                  <p>Convert to USD automatically if needed</p>
                </div>
                <div className="wallet-option">
                  <strong>Electrum</strong>
                  <p>Advanced Bitcoin wallet with Lightning</p>
                </div>
                <div className="wallet-option">
                  <strong>Phoenix</strong>
                  <p>Mobile Lightning wallet</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="step-content">
            <h2><Globe size={24} /> Development Experience</h2>
            <p>Tell us about your game development background</p>

            <div className="form-group">
              <label>Development Experience Level</label>
              <select
                value={formData.developmentExperience}
                onChange={(e) => updateFormData('developmentExperience', e.target.value)}
              >
                <option value="beginner">Beginner (0-1 years)</option>
                <option value="intermediate">Intermediate (2-5 years)</option>
                <option value="experienced">Experienced (5-10 years)</option>
                <option value="professional">Professional (10+ years)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Previous Games (if any)</label>
              {formData.previousGames.map((game, index) => (
                <div key={index} className="array-input">
                  <input
                    type="text"
                    value={game}
                    onChange={(e) => updateArrayItem('previousGames', index, e.target.value)}
                    placeholder="Game title"
                  />
                  {formData.previousGames.length > 1 && (
                    <button type="button" onClick={() => removeArrayItem('previousGames', index)}>×</button>
                  )}
                </div>
              ))}
              <button type="button" className="add-item-btn" onClick={() => addArrayItem('previousGames')}>
                + Add Another Game
              </button>
            </div>

            <div className="form-group">
              <label>Game Engines You Use</label>
              {formData.gameEngines.map((engine, index) => (
                <div key={index} className="array-input">
                  <select
                    value={engine}
                    onChange={(e) => updateArrayItem('gameEngines', index, e.target.value)}
                  >
                    <option value="">Select engine</option>
                    <option value="Unity">Unity</option>
                    <option value="Unreal Engine">Unreal Engine</option>
                    <option value="Godot">Godot</option>
                    <option value="GameMaker Studio">GameMaker Studio</option>
                    <option value="Construct 3">Construct 3</option>
                    <option value="RPG Maker">RPG Maker</option>
                    <option value="Custom Engine">Custom Engine</option>
                    <option value="Other">Other</option>
                  </select>
                  {formData.gameEngines.length > 1 && (
                    <button type="button" onClick={() => removeArrayItem('gameEngines', index)}>×</button>
                  )}
                </div>
              ))}
              <button type="button" className="add-item-btn" onClick={() => addArrayItem('gameEngines')}>
                + Add Another Engine
              </button>
            </div>

            <div className="form-group">
              <label>Target Platforms</label>
              <div className="checkbox-group">
                {['windows', 'macos', 'linux', 'web', 'mobile'].map(platform => (
                  <label key={platform} className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={formData.targetPlatforms.includes(platform)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData('targetPlatforms', [...formData.targetPlatforms, platform]);
                        } else {
                          updateFormData('targetPlatforms', formData.targetPlatforms.filter(p => p !== platform));
                        }
                      }}
                    />
                    <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>First Game Title *</label>
              <input
                type="text"
                value={formData.firstGameTitle}
                onChange={(e) => updateFormData('firstGameTitle', e.target.value)}
                placeholder="The name of your first game to publish"
                className={errors.firstGameTitle ? 'error' : ''}
              />
              {errors.firstGameTitle && <span className="error-message">{errors.firstGameTitle}</span>}
            </div>

            <div className="form-group">
              <label>Game Description *</label>
              <textarea
                value={formData.firstGameDescription}
                onChange={(e) => updateFormData('firstGameDescription', e.target.value)}
                placeholder="Brief description of your game..."
                rows={4}
                className={errors.firstGameDescription ? 'error' : ''}
              />
              {errors.firstGameDescription && <span className="error-message">{errors.firstGameDescription}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Game Genre</label>
                <select
                  value={formData.firstGameGenre}
                  onChange={(e) => updateFormData('firstGameGenre', e.target.value)}
                >
                  <option value="">Select genre</option>
                  <option value="Action">Action</option>
                  <option value="Adventure">Adventure</option>
                  <option value="RPG">RPG</option>
                  <option value="Strategy">Strategy</option>
                  <option value="Simulation">Simulation</option>
                  <option value="Puzzle">Puzzle</option>
                  <option value="Racing">Racing</option>
                  <option value="Sports">Sports</option>
                  <option value="Casual">Casual</option>
                  <option value="Indie">Indie</option>
                </select>
              </div>

              <div className="form-group">
                <label>Estimated Release Date</label>
                <input
                  type="date"
                  value={formData.estimatedReleaseDate}
                  onChange={(e) => updateFormData('estimatedReleaseDate', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Marketing Budget (USD)</label>
              <input
                type="number"
                value={formData.marketingBudgetUsd}
                onChange={(e) => updateFormData('marketingBudgetUsd', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
              <small>Optional: Helps us understand your marketing plans</small>
            </div>

            <div className="form-group">
              <label>Social Media & Links</label>
              <div className="social-links">
                <input
                  type="url"
                  value={formData.socialMediaLinks.twitter}
                  onChange={(e) => updateFormData('socialMediaLinks', { ...formData.socialMediaLinks, twitter: e.target.value })}
                  placeholder="Twitter/X profile"
                />
                <input
                  type="url"
                  value={formData.socialMediaLinks.discord}
                  onChange={(e) => updateFormData('socialMediaLinks', { ...formData.socialMediaLinks, discord: e.target.value })}
                  placeholder="Discord server"
                />
                <input
                  type="url"
                  value={formData.socialMediaLinks.youtube}
                  onChange={(e) => updateFormData('socialMediaLinks', { ...formData.socialMediaLinks, youtube: e.target.value })}
                  placeholder="YouTube channel"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="step-content">
            <h2><CheckCircle size={24} /> Legal & Terms</h2>
            <p>Review and accept our terms to complete your application</p>

            <div className="terms-section">
              <h3>🎮 Bitcoin Gaming Marketplace - Developer Benefits</h3>
              <div className="benefits-grid">
                <div className="benefit-item">
                  <strong>⚡ 70% Revenue Share</strong>
                  <p>Keep 70% of all sales (vs Steam's 70% after $10M)</p>
                </div>
                <div className="benefit-item">
                  <strong>🚀 Instant Payouts</strong>
                  <p>Get paid in Bitcoin immediately after each sale</p>
                </div>
                <div className="benefit-item">
                  <strong>🌍 Global Reach</strong>
                  <p>No geographic restrictions or currency barriers</p>
                </div>
                <div className="benefit-item">
                  <strong>📈 Marketing Support</strong>
                  <p>Featured placement and promotional opportunities</p>
                </div>
                <div className="benefit-item">
                  <strong>🔧 Developer Tools</strong>
                  <p>Advanced analytics and A/B testing tools</p>
                </div>
                <div className="benefit-item">
                  <strong>💰 Low Fees</strong>
                  <p>One-time $20 fee (50,000 sats) vs Steam's $100</p>
                </div>
              </div>
            </div>

            <div className="fee-section">
              <h3>💳 Developer Fee: 50,000 sats (~$20)</h3>
              <p>One-time fee to prevent spam and cover review costs. Much lower than Steam's $100 fee!</p>
              <div className="fee-comparison">
                <div className="fee-item">
                  <span className="platform">Steam</span>
                  <span className="amount">$100 USD</span>
                </div>
                <div className="fee-item highlight">
                  <span className="platform">Bitcoin Gaming</span>
                  <span className="amount">50,000 sats (~$20)</span>
                </div>
              </div>
            </div>

            <div className="legal-checkboxes">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={formData.agreesToTerms}
                  onChange={(e) => updateFormData('agreesToTerms', e.target.checked)}
                />
                <span>
                  I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a> *
                </span>
              </label>
              {errors.agreesToTerms && <span className="error-message">{errors.agreesToTerms}</span>}

              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={formData.agreesToRevenueShare}
                  onChange={(e) => updateFormData('agreesToRevenueShare', e.target.checked)}
                />
                <span>
                  I agree to the 70/30 revenue share (70% to developer, 30% to platform) *
                </span>
              </label>
              {errors.agreesToRevenueShare && <span className="error-message">{errors.agreesToRevenueShare}</span>}

              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={formData.contentRatingAcknowledgment}
                  onChange={(e) => updateFormData('contentRatingAcknowledgment', e.target.checked)}
                />
                <span>
                  I understand content rating requirements and will provide accurate ratings for my games *
                </span>
              </label>
              {errors.contentRatingAcknowledgment && <span className="error-message">{errors.contentRatingAcknowledgment}</span>}
            </div>

            <div className="next-steps">
              <h3>🎯 What Happens Next?</h3>
              <ol>
                <li><strong>Application Review</strong> - We'll review your application within 24-48 hours</li>
                <li><strong>Fee Payment</strong> - Pay the 50,000 sat developer fee via Lightning or Bitcoin</li>
                <li><strong>Account Activation</strong> - Your developer account will be activated</li>
                <li><strong>Game Submission</strong> - Start uploading your games immediately</li>
                <li><strong>Go Live</strong> - Games go live after content review (usually same day)</li>
              </ol>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="step-content success-step">
            <div className="success-animation">
              <CheckCircle size={64} className="success-icon" />
            </div>
            <h2>🎉 Application Submitted Successfully!</h2>
            <p>Welcome to the Bitcoin Gaming Marketplace developer community!</p>

            <div className="success-details">
              <h3>What's Next?</h3>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-marker">1</div>
                  <div className="timeline-content">
                    <strong>Review Process</strong>
                    <p>We'll review your application within 24-48 hours</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker">2</div>
                  <div className="timeline-content">
                    <strong>Payment</strong>
                    <p>You'll receive a Lightning invoice for 50,000 sats</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker">3</div>
                  <div className="timeline-content">
                    <strong>Developer Access</strong>
                    <p>Full developer tools and game submission access</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-info">
              <h3>📧 Stay in Touch</h3>
              <p>We'll send updates to <strong>{formData.email}</strong></p>
              <p>Join our developer Discord: <a href="https://discord.gg/btcgaming" target="_blank">discord.gg/btcgaming</a></p>
            </div>

            <div className="success-actions">
              <button className="btn-primary" onClick={() => onComplete(formData)}>
                Continue to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {currentStep < 6 && (
        <div className="onboarding-actions">
          {currentStep > 1 && (
            <button className="btn-secondary" onClick={prevStep}>
              <ArrowLeft size={16} />
              Previous
            </button>
          )}
          
          <div className="spacer" />
          
          {currentStep < 5 ? (
            <button className="btn-primary" onClick={nextStep}>
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button 
              className="btn-primary" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DeveloperOnboarding;
