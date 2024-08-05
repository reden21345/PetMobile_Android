import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import baseURL from '../../assets/common/baseurl';
import Toast from 'react-native-toast-message';

const Home = () => {
  const [latestData, setLatestData] = useState({
    cellFood: {},
    cellWeight: {},
    pH: {},
    rfid: {},
    foodLevel: {},
    waterLevel: {},
  });

  const fetchLatestData = async () => {
    try {
      const [
        cellFoodResponse,
        cellWeightResponse,
        pHResponse,
        rfidResponse,
        foodLevelResponse,
        waterLevelResponse,
      ] = await Promise.all([
        axios.get(`${baseURL}/loadcell-food-data`),
        axios.get(`${baseURL}/loadcell-data`),
        axios.get(`${baseURL}/ph-data`),
        axios.get(`${baseURL}/rfid-data`),
        axios.get(`${baseURL}/foodlevel-data`),
        axios.get(`${baseURL}/waterlevel-data`),
      ]);

      const processLatestData = (data) => {
        return data.length ? data[data.length - 1] : {};
      };

      const newLatestData = {
        cellFood: processLatestData(cellFoodResponse.data),
        cellWeight: processLatestData(cellWeightResponse.data),
        pH: processLatestData(pHResponse.data),
        rfid: processLatestData(rfidResponse.data),
        foodLevel: processLatestData(foodLevelResponse.data),
        waterLevel: processLatestData(waterLevelResponse.data),
      };

      setLatestData(newLatestData);

      // Toast conditions
      if (newLatestData.foodLevel.foodLevel <= 20) {
        Toast.show({
          type: 'error',
          text1: 'Warning',
          text2: 'Food stock is low!',
          topOffset: 60,
          props: {
            onClose: () => Toast.hide(), // Adding close button functionality
          },
        });
      }
      if (newLatestData.pH.ph <= 3 || newLatestData.pH.ph > 8) {
        Toast.show({
          type: 'error',
          text1: 'Warning',
          text2: 'pH level is not safe!',
          topOffset: 60,
          props: {
            onClose: () => Toast.hide(), // Adding close button functionality
          },
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchLatestData(); // Initial fetch
    const interval = setInterval(fetchLatestData, 3000); // Fetch every 3 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const renderScale = (title, value, icon, unit, style, toastMessage) => (
    <View style={[styles.sensorContainer, style]}>
      <Text style={styles.sensorTitle}>{title}</Text>
      <View style={[styles.scale, style]}>
        {icon}
        <Text style={styles.scaleText}>{value !== undefined && value !== null ? `${value} ${unit}` : 'N/A'}</Text>
      </View>
    </View>
  );

  const getToastMessage = (dataType, value) => {
    if (dataType === 'foodLevel' && value <= 20) {
      return {
        text1: 'Warning',
        text2: 'Food stock is low!',
        onClose: () => Toast.hide(),
      };
    }
    if (dataType === 'pH' && (value <= 6 || value > 8)) {
      return {
        text1: 'Warning',
        text2: 'pH level is not safe!',
        onClose: () => Toast.hide(),
      };
    }
    return null;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.row}>
        {renderScale(
          'Food Weight',
          latestData.cellFood.weight,
          <FontAwesome5 name="utensils" size={64} color="black" />,
          'g',
          styles.cellFood,
          getToastMessage('cellFood', latestData.cellFood.weight)
        )}
        {renderScale(
          'Cat Weight',
          latestData.cellWeight.weightScale,
          <FontAwesome5 name="weight" size={64} color="black" />,
          'kg',
          styles.cellWeight,
          getToastMessage('cellWeight', latestData.cellWeight.weightScale)
        )}
      </View>
      <View style={styles.row}>
        {renderScale(
          'pH Level',
          latestData.pH.ph,
          <MaterialCommunityIcons name="water-percent" size={64} color="black" />,
          'pH',
          styles.pH,
          getToastMessage('pH', latestData.pH.ph)
        )}
        {renderScale(
          'RFID',
          latestData.rfid.uid,
          <MaterialCommunityIcons name="tag" size={64} color="black" />,
          '',
          styles.rfid,
          getToastMessage('rfid', latestData.rfid.uid)
        )}
      </View>
      <View style={styles.row}>
        {renderScale(
          'Food Level',
          latestData.foodLevel.foodLevel,
          <FontAwesome5 name="box" size={64} color="black" />,
          'g',
          styles.foodLevel,
          getToastMessage('foodLevel', latestData.foodLevel.foodLevel)
        )}
        {renderScale(
          'Water Level',
          latestData.waterLevel.waterLevel,
          <MaterialCommunityIcons name="cup-water" size={64} color="black" />,
          '%',
          styles.waterLevel,
          getToastMessage('waterLevel', latestData.waterLevel.waterLevel)
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  sensorContainer: { 
    flex: 1, 
    alignItems: 'center', 
    marginHorizontal: 10, 
    height: 200,
    justifyContent: 'space-between' 
  },
  sensorTitle: { fontSize: 20, marginBottom: 10, marginTop: 10, fontWeight: '500',},
  scale: { 
    width: 150, 
    height: 150, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 75, 
    borderWidth: 5,
    marginBottom: 20,
  },
  scaleText: { fontSize: 18, marginTop: 10 },
  cellFood: { borderColor: '#f39c12', backgroundColor: '#f7dc6f' },
  cellWeight: { borderColor: '#27ae60', backgroundColor: '#abebc6' },
  pH: { borderColor: '#2980b9', backgroundColor: '#aed6f1' },
  rfid: { borderColor: '#8e44ad', backgroundColor: '#d7bde2' },
  foodLevel: { borderColor: '#e67e22', backgroundColor: '#f0b27a' },
  waterLevel: { borderColor: '#3498db', backgroundColor: '#85c1e9' },
  toastContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'red', 
    padding: 10, 
    borderRadius: 5, 
    position: 'absolute', 
    // bottom: 0, // Positioned at the bottom of the sensor container
    width: '100%',
  },
  toastText1: { color: 'white', fontWeight: 'bold', marginRight: 10 },
  toastText2: { color: 'white', marginRight: 10 },
  toastCloseButton: { color: 'white', fontWeight: 'bold' },
});

export default Home;
