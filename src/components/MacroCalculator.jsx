import React, { useState } from 'react';
import { useNutritionContext } from '../hooks/useNutritionContext';
import { profileAPI } from '../services/apiService';

/**
 * Macro Calculator Component
 * Calculates personalized macro goals based on user profile and fitness goals
 * Uses Mifflin-St Jeor equation for BMR calculation
 */
const MacroCalculator = ({ onClose }) => {
  const { dispatch } = useNutritionContext();
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    weight: '',
    weightUnit: 'lbs',
    height: '',
    heightUnit: 'inches',
    activityLevel: '1.375',
    goal: 'maintain',
    customDeficit: 500,
    targetWeight: '',
    timeFrame: '',
    customProtein: 30,
    customCarbs: 40,
    customFat: 30
  });

  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [customizeRatios, setCustomizeRatios] = useState(false);
  const [customRatios, setCustomRatios] = useState({
    protein: 30,
    carbs: 45,
    fat: 25
  });

  // Activity level options
  const activityLevels = [
    { value: '1.2', label: 'Sedentary', description: 'Little to no exercise' },
    { value: '1.375', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
    { value: '1.465', label: 'Moderately Active', description: 'Moderate exercise 4-5 days/week' },
    { value: '1.55', label: 'Very Active', description: 'Intense exercise 6-7 days/week' },
    { value: '1.725', label: 'Extra Active', description: 'Vigorous exercise daily + physical job' },
    { value: '1.9', label: 'Athlete', description: 'Professional athlete / twice daily training' }
  ];

  // Goal options with macro ratios (research-based)
  const goals = {
    lose: {
      label: 'Weight Loss',
      description: 'Lose fat while preserving muscle',
      calorieAdjustment: -500,
      macroRatio: { protein: 30, carbs: 45, fat: 25 }
    },
    maintain: {
      label: 'Maintain Weight',
      description: 'Maintain current weight',
      calorieAdjustment: 0,
      macroRatio: { protein: 25, carbs: 60, fat: 15 }
    },
    gain: {
      label: 'Muscle Gain',
      description: 'Build muscle mass',
      calorieAdjustment: 300,
      macroRatio: { protein: 30, carbs: 50, fat: 20 }
    },
    custom: {
      label: 'Custom Goal',
      description: 'Set your own target weight and macros',
      calorieAdjustment: 0,
      macroRatio: { protein: 30, carbs: 40, fat: 30 }
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update custom ratios when goal changes
    if (name === 'goal' && goals[value]) {
      setCustomRatios(goals[value].macroRatio);
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Handle custom ratio changes
  const handleRatioChange = (macro, value) => {
    const newValue = parseInt(value) || 0;
    setCustomRatios(prev => {
      const updated = { ...prev, [macro]: newValue };
      // Auto-adjust other macros to keep total at 100%
      const total = updated.protein + updated.carbs + updated.fat;
      if (total !== 100) {
        // Distribute the difference proportionally
        const diff = 100 - total;
        const others = Object.keys(updated).filter(k => k !== macro);
        const adjustment = Math.round(diff / others.length);
        others.forEach(key => {
          updated[key] = Math.max(0, Math.min(100, updated[key] + adjustment));
        });
      }
      return updated;
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Please enter your name';
    }
    
    if (!formData.age || formData.age < 15 || formData.age > 100) {
      newErrors.age = 'Please enter a valid age (15-100)';
    }
    
    if (!formData.weight || formData.weight <= 0) {
      newErrors.weight = 'Please enter a valid weight';
    }
    
    if (!formData.height || formData.height <= 0) {
      newErrors.height = 'Please enter a valid height';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Convert weight to kg
  const getWeightInKg = () => {
    const weight = parseFloat(formData.weight);
    return formData.weightUnit === 'lbs' ? weight / 2.2 : weight;
  };

  // Convert height to cm
  const getHeightInCm = () => {
    const height = parseFloat(formData.height);
    return formData.heightUnit === 'inches' ? height * 2.54 : height;
  };

  // Calculate BMR using Mifflin-St Jeor equation
  const calculateBMR = () => {
    const weightKg = getWeightInKg();
    const heightCm = getHeightInCm();
    const age = parseInt(formData.age);
    
    console.log('BMR Calculation Debug:', {
      weight: formData.weight,
      weightUnit: formData.weightUnit,
      weightKg,
      height: formData.height,
      heightUnit: formData.heightUnit,
      heightCm,
      age,
      gender: formData.gender
    });
    
    let bmr;
    if (formData.gender === 'male') {
      // Men: BMR = (10 × weight [kg]) + (6.25 × height [cm]) – (5 × age [years]) + 5
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
      console.log('BMR calculation:', `(10 × ${weightKg}) + (6.25 × ${heightCm}) - (5 × ${age}) + 5 = ${bmr}`);
    } else {
      // Women: BMR = (10 × weight [kg]) + (6.25 × height [cm]) – (5 × age [years]) – 161
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
      console.log('BMR calculation:', `(10 × ${weightKg}) + (6.25 × ${heightCm}) - (5 × ${age}) - 161 = ${bmr}`);
    }
    
    return Math.round(bmr);
  };

  // Calculate TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = (bmr) => {
    const activityMultiplier = parseFloat(formData.activityLevel);
    return Math.round(bmr * activityMultiplier);
  };

  // Calculate target calories based on goal
  const calculateTargetCalories = (tdee) => {
    const goal = goals[formData.goal];
    
    // For custom goal, calculate based on target weight and time frame
    if (formData.goal === 'custom' && formData.targetWeight && formData.timeFrame) {
      const currentWeightLbs = formData.weightUnit === 'lbs' 
        ? parseFloat(formData.weight)
        : parseFloat(formData.weight) * 2.2;
      
      const targetWeightLbs = formData.weightUnit === 'lbs' 
        ? parseFloat(formData.targetWeight) 
        : parseFloat(formData.targetWeight) * 2.2;
      
      const weightDiffLbs = targetWeightLbs - currentWeightLbs;
      const timeFrameWeeks = parseFloat(formData.timeFrame);
      
      // Formula: (weight to lose/gain in lbs × 3500 calories per lb) ÷ weeks ÷ 7 days
      const dailyCalorieAdjustment = (weightDiffLbs * 3500) / timeFrameWeeks / 7;
      const targetCalories = tdee + dailyCalorieAdjustment;
      
      // Set minimum floor at 1000 calories
      const minimumCalories = 1000;
      
      return Math.round(Math.max(targetCalories, minimumCalories));
    }
    
    return Math.round(tdee + goal.calorieAdjustment);
  };

  // Calculate macros in grams
  const calculateMacros = (targetCalories) => {
    const goal = goals[formData.goal];
    // Use custom ratios if customization is enabled, otherwise use default
    let ratio = customizeRatios ? customRatios : goal.macroRatio;
    
    // Use custom formula for custom goal based on target weight
    if (formData.goal === 'custom' && formData.targetWeight) {
      // Protein: 1g per lb of target weight (or 2.2g per kg)
      const targetWeightLbs = formData.weightUnit === 'lbs' 
        ? parseFloat(formData.targetWeight)
        : parseFloat(formData.targetWeight) * 2.2;
      
      const proteinGrams = Math.round(targetWeightLbs);
      const proteinCalories = proteinGrams * 4;
      
      // Fat: 25-30% of total calories (using 27.5% average)
      const fatCalories = targetCalories * 0.275;
      const fatGrams = Math.round(fatCalories / 9);
      
      // Carbs: Remaining calories
      const remainingCalories = targetCalories - proteinCalories - fatCalories;
      const carbsGrams = Math.round(remainingCalories / 4);
      
      return {
        protein: proteinGrams,
        carbs: Math.max(carbsGrams, 50), // Minimum 50g carbs
        fat: fatGrams,
        fiber: 30
      };
    }
    
    // Calculate calories for each macro (standard goals)
    const proteinCalories = targetCalories * (ratio.protein / 100);
    const carbsCalories = targetCalories * (ratio.carbs / 100);
    const fatCalories = targetCalories * (ratio.fat / 100);
    
    // Convert to grams (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g)
    return {
      protein: Math.round(proteinCalories / 4),
      carbs: Math.round(carbsCalories / 4),
      fat: Math.round(fatCalories / 9),
      fiber: 30 // Standard recommendation
    };
  };

  // Handle form submission
  const handleCalculate = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Calculate all values
    const bmr = calculateBMR();
    const tdee = calculateTDEE(bmr);
    const targetCalories = calculateTargetCalories(tdee);
    const macros = calculateMacros(targetCalories);
    
    const calculationResults = {
      bmr,
      tdee,
      targetCalories,
      macros,
      goal: goals[formData.goal]
    };
    
    setResults(calculationResults);
  };

  // Apply calculated goals to user profile
  const handleApplyGoals = async () => {
    if (!results) return;
    
    try {
      // Save user name to localStorage and context
      if (formData.name) {
        localStorage.setItem('userName', formData.name);
      }
      
      // Save profile to backend database
      await profileAPI.update({
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        weight: parseFloat(formData.weight),
        weight_unit: formData.weightUnit,
        height: parseFloat(formData.height),
        height_unit: formData.heightUnit,
        activity_level: parseFloat(formData.activityLevel),
        goal: formData.goal
      });
      
      console.log('Profile saved to database successfully');
      
      // Update goals in context
      dispatch({
        type: 'UPDATE_DAILY_GOALS',
        payload: {
          calories: results.targetCalories,
          protein: results.macros.protein,
          carbs: results.macros.carbs,
          fat: results.macros.fat,
          fiber: results.macros.fiber
        }
      });
      
      dispatch({ type: 'SAVE_USER_DATA' });
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile to database. Your goals were saved locally.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white rounded-t-lg">
        <h2 className="text-2xl font-bold">Macro Calculator</h2>
        <p className="text-purple-100 mt-1">
          Calculate your personalized daily macro goals based on your profile and fitness objectives
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={handleCalculate} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., John Doe"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="15"
                  max="100"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.age ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 30"
                />
                {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Weight */}
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Weight <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.weight ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 150"
                  />
                  <select
                    name="weightUnit"
                    value={formData.weightUnit}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="lbs">lbs</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
                {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
              </div>

              {/* Height */}
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                  Height <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    id="height"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.height ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 65"
                  />
                  <select
                    name="heightUnit"
                    value={formData.heightUnit}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="inches">inches</option>
                    <option value="cm">cm</option>
                  </select>
                </div>
                {errors.height && <p className="mt-1 text-sm text-red-600">{errors.height}</p>}
              </div>
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Level</h3>
            <div className="space-y-2">
              {activityLevels.map((level) => (
                <label
                  key={level.value}
                  className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.activityLevel === level.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="activityLevel"
                    value={level.value}
                    checked={formData.activityLevel === level.value}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{level.label}</div>
                    <div className="text-sm text-gray-500">{level.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Fitness Goal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(goals).map(([key, goal]) => (
                <label
                  key={key}
                  className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.goal === key
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="goal"
                    value={key}
                    checked={formData.goal === key}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="font-semibold text-gray-900 mb-1">{goal.label}</div>
                  <div className="text-sm text-gray-600 mb-2">{goal.description}</div>
                  <div className="text-xs text-gray-500">
                    Macros: {goal.macroRatio.protein}% P / {goal.macroRatio.carbs}% C / {goal.macroRatio.fat}% F
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Customize Macro Ratios */}
          {formData.goal !== 'custom' && (
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Customize Macro Ratios</h4>
                <button
                  type="button"
                  onClick={() => setCustomizeRatios(!customizeRatios)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    customizeRatios
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {customizeRatios ? 'Using Custom' : 'Use Default'}
                </button>
              </div>
              
              {customizeRatios && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Adjust the percentages below. Total must equal 100%.
                  </p>
                  
                  {/* Protein Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">Protein</label>
                      <span className="text-sm font-semibold text-purple-600">{customRatios.protein}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      value={customRatios.protein}
                      onChange={(e) => handleRatioChange('protein', e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>
                  
                  {/* Carbs Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">Carbs</label>
                      <span className="text-sm font-semibold text-blue-600">{customRatios.carbs}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="70"
                      value={customRatios.carbs}
                      onChange={(e) => handleRatioChange('carbs', e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  
                  {/* Fat Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">Fat</label>
                      <span className="text-sm font-semibold text-orange-600">{customRatios.fat}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="40"
                      value={customRatios.fat}
                      onChange={(e) => handleRatioChange('fat', e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                  </div>
                  
                  {/* Total Display */}
                  <div className="pt-2 border-t border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Total:</span>
                      <span className={`text-sm font-bold ${
                        (customRatios.protein + customRatios.carbs + customRatios.fat) === 100
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {customRatios.protein + customRatios.carbs + customRatios.fat}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Custom Goal Fields */}
          {formData.goal === 'custom' && (
            <div className="p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
              <h4 className="font-semibold text-gray-900 mb-4">Custom Goal Settings</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="targetWeight" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Weight ({formData.weightUnit}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="targetWeight"
                    name="targetWeight"
                    value={formData.targetWeight}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter your goal weight"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {formData.weight} {formData.weightUnit}
                    {formData.targetWeight && formData.weight && (
                      <span className="ml-2 font-semibold">
                        ({formData.targetWeight > formData.weight ? '+' : ''}{(formData.targetWeight - formData.weight).toFixed(1)} {formData.weightUnit})
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <label htmlFor="timeFrame" className="block text-sm font-medium text-gray-700 mb-1">
                    Time Frame (weeks) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="timeFrame"
                    name="timeFrame"
                    value={formData.timeFrame}
                    onChange={handleChange}
                    min="1"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., 12"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.targetWeight && formData.weight && formData.timeFrame ? (
                      <>
                        {Math.abs(formData.targetWeight - formData.weight) > 0 ? (
                          <>
                            {(Math.abs(formData.targetWeight - formData.weight) / formData.timeFrame).toFixed(2)} {formData.weightUnit}/week
                            <br />
                            <span className="text-xs text-gray-500">
                              (Safe rate: {formData.weightUnit === 'lbs' ? '1-2 lbs' : '0.5-1 kg'}/week)
                            </span>
                          </>
                        ) : (
                          'Maintenance'
                        )}
                      </>
                    ) : (
                      'Enter target weight'
                    )}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>💡 How it works:</strong> Enter your target weight and time frame. The calculator will:
                </p>
                <ul className="text-xs text-blue-700 mt-2 ml-4 list-disc">
                  <li>Calculate daily calorie adjustment: (weight change × 3500 cal/lb) ÷ weeks ÷ 7 days</li>
                  <li>Protein: 1g per lb of target weight (muscle preservation)</li>
                  <li>Fat: 25-30% of calories (hormone health)</li>
                  <li>Carbs: Remaining calories (energy)</li>
                  <li>Calories adjusted for safe weight change rate</li>
                </ul>
              </div>
            </div>
          )}

          {/* Calculate Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
            >
              Calculate My Macros
            </button>
          </div>
        </form>

        {/* Results */}
        {results && (
          <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Personalized Macro Goals</h3>
            
            {/* Calorie Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600 mb-1">Basal Metabolic Rate (BMR)</div>
                <div className="text-2xl font-bold text-gray-900">{results.bmr}</div>
                <div className="text-xs text-gray-500">calories at rest</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600 mb-1">Total Daily Energy Expenditure</div>
                <div className="text-2xl font-bold text-blue-700">{results.tdee}</div>
                <div className="text-xs text-gray-500">maintenance calories</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600 mb-1">Target Daily Calories</div>
                <div className="text-2xl font-bold text-purple-700">{results.targetCalories}</div>
                <div className="text-xs text-gray-500">for {results.goal.label.toLowerCase()}</div>
              </div>
            </div>

            {/* Macro Goals */}
            <div className="bg-white p-6 rounded-lg shadow mb-4">
              <h4 className="font-semibold text-gray-900 mb-4">Daily Macro Targets</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="text-xs text-gray-600">Protein</span>
                  </div>
                  <div className="text-2xl font-bold text-red-700">{results.macros.protein}g</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {results.goal.macroRatio.protein}% of calories
                  </div>
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="text-xs text-gray-600">Carbs</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-700">{results.macros.carbs}g</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {results.goal.macroRatio.carbs}% of calories
                  </div>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-xs text-gray-600">Fat</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700">{results.macros.fat}g</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {results.goal.macroRatio.fat}% of calories
                  </div>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-purple-400"></span>
                    <span className="text-xs text-gray-600">Fiber</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-700">{results.macros.fiber}g</div>
                  <div className="text-xs text-gray-500 mt-1">
                    recommended daily
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex justify-end">
              <button
                onClick={handleApplyGoals}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold shadow-lg"
              >
                ✓ Apply These Goals to My Profile
              </button>
            </div>

            {/* Info Note */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>💡 Note:</strong> These calculations use the Mifflin-St Jeor equation, one of the most accurate formulas for estimating calorie needs. 
                Adjust based on your results and how you feel. Everyone's metabolism is unique!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MacroCalculator;
