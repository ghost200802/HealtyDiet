import { useState, useEffect } from 'react';
import { prepareNutritionData } from '@/services/NutritionService';

/**
 * 自定义Hook，用于加载和处理食谱营养详情数据
 * @param {Array} recipeItems - 食谱中的食物项目
 * @param {Object} totalNutrition - 食谱的总营养成分
 * @returns {Object} - 包含各种营养素数据和加载状态
 */
const useNutritionDetails = (recipeItems, totalNutrition) => {
  // 为每种营养素创建状态
  const [caloriesData, setCaloriesData] = useState([]);
  const [proteinData, setProteinData] = useState([]);
  const [carbsData, setCarbsData] = useState([]);
  const [fatData, setFatData] = useState([]);
  const [fiberData, setFiberData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 加载所有营养素数据
  useEffect(() => {
    const loadNutritionData = async () => {
      setLoading(true);
      try {
        // 并行加载所有营养素数据
        const [calories, protein, carbs, fat, fiber] = await Promise.all([
          prepareNutritionData(recipeItems, totalNutrition, 'calories'),
          prepareNutritionData(recipeItems, totalNutrition, 'protein'),
          prepareNutritionData(recipeItems, totalNutrition, 'carbs'),
          prepareNutritionData(recipeItems, totalNutrition, 'fat'),
          prepareNutritionData(recipeItems, totalNutrition, 'fiber')
        ]);

        setCaloriesData(calories);
        setProteinData(protein);
        setCarbsData(carbs);
        setFatData(fat);
        setFiberData(fiber);
      } catch (error) {
        console.error('加载营养素数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNutritionData();
  }, [recipeItems, totalNutrition]);

  return {
    caloriesData,
    proteinData,
    carbsData,
    fatData,
    fiberData,
    loading
  };
};

export default useNutritionDetails;