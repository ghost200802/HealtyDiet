import { useState, useEffect } from 'react';
import { calculateDietScoreWithUserData } from '@/services/DietScoreService';
import { calculateNutrientScore, getSuggestionByScore } from '@/services/NutritionService';
import dailyNeeds from '@data/needs/DailyNeeds.json';

/**
 * 食谱评分计算钩子
 * @param {Array} dietItems - 食谱项目数组
 * @param {Object} user - 用户数据
 * @returns {Object} - 包含评分、详情和建议的对象
 */
const useDietScore = (dietItems, user) => {
  // 使用useState存储食谱评分和详细信息
  const [dietScore, setDietScore] = useState(0);
  const [scoreDetails, setScoreDetails] = useState(null);
  const [scoreSuggestions, setScoreSuggestions] = useState(null);

  // 使用useEffect处理评分计算
  useEffect(() => {
    const getScore = () => {
      if (!dietItems || dietItems.length === 0 || !user) {
        console.log('无法计算评分：dietItems或user不存在', { dietItems, user });
        setDietScore(0);
        return;
      }
      
      console.log('计算评分的输入参数：', { dietItems, user, standardNeeds: dailyNeeds.standardNeeds });
      
      try {
        // 调用DietScoreService中的评分函数
        const result = calculateDietScoreWithUserData(dietItems, user, dailyNeeds.standardNeeds);
        console.log('计算得到的评分：', result);
        setDietScore(result.score);
        
        // 使用nutrition数据计算详情和建议
        const targetCalories = user.dci || 2000;
        const targetProtein = user.protein || 75;
        const targetCarbs = user.carbs || 250;
        const targetFat = user.fat || 55;
        const targetFiber = user.fiber || 25;
        
        // 计算各项得分
        const detail = {
          calories: Math.max(0, Math.min(100, 100 * calculateNutrientScore(result.nutrition.calories, targetCalories))),
          protein: Math.max(0, Math.min(100, 100 * calculateNutrientScore(result.nutrition.protein, targetProtein))),
          carbs: Math.max(0, Math.min(100, 100 * calculateNutrientScore(result.nutrition.carbs, targetCarbs))),
          fat: Math.max(0, Math.min(100, 100 * calculateNutrientScore(result.nutrition.fat, targetFat))),
          fiber: Math.max(0, Math.min(100, 100 * calculateNutrientScore(result.nutrition.fiber, targetFiber)))
        };
        
        // 生成建议
        const suggestions = {
          calories: getSuggestionByScore(detail.calories, '热量', result.nutrition.calories, targetCalories),
          protein: getSuggestionByScore(detail.protein, '蛋白质', result.nutrition.protein, targetProtein),
          carbs: getSuggestionByScore(detail.carbs, '碳水化合物', result.nutrition.carbs, targetCarbs),
          fat: getSuggestionByScore(detail.fat, '脂肪', result.nutrition.fat, targetFat),
          fiber: getSuggestionByScore(detail.fiber, '膳食纤维', result.nutrition.fiber, targetFiber)
        };
        
        setScoreDetails(detail);
        setScoreSuggestions(suggestions);
      } catch (error) {
        console.error('计算评分时出错：', error);
        setDietScore(0);
        setScoreDetails(null);
        setScoreSuggestions(null);
      }
    };
    
    getScore();
  }, [dietItems, user]);

  return { dietScore, scoreDetails, scoreSuggestions };
};

export default useDietScore;