import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { Table, Row, Rows } from 'react-native-table-component';
import { BarChart } from 'react-native-chart-kit';
import axios from 'axios';
import baseURL from '../../../assets/common/baseurl';

const DataTableScreen = () => {
  const [tableHead, setTableHead] = useState(['Water', 'Unit', 'Time']);
  const [tableData, setTableData] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
      },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#fff',
    backgroundGradientToOpacity: 0.5,

    fillShadowGradientOpacity: 1,
    color: (opacity = 1) => `#023047`,
    labelColor: (opacity = 1) => `#333`,
    strokeWidth: 2,

    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${baseURL}/waterlevel-data`);
      const data = response.data;

      if (Array.isArray(data)) {
        // Sort data by timestamp in descending order
        const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const formattedData = sortedData.map(item => [
          item.waterLevel,
          item.unit,
          new Date(item.timestamp).toLocaleString(),
        ]);

        setTableData(formattedData);

        // Prepare data for the chart
        const labels = sortedData.map(item => new Date(item.timestamp).toLocaleDateString());
        const dataPoints = sortedData.map(item => item.waterLevel);

        setChartData({
          labels,
          datasets: [
            {
              data: dataPoints,
            },
          ],
        });
      } else {
        console.error('Data is not an array:', data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data initially and set up the interval
  useEffect(() => {
    try {
      fetchData(); // Initial fetch

      const interval = setInterval(fetchData, 3000); // Fetch every 3 seconds

      return () => clearInterval(interval); // Cleanup on component unmount
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (tableData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Water Level History</Text>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ScrollView horizontal>
          {chartData? <View style={styles.chartContainer}>
            <BarChart
              data={chartData}
              width={Dimensions.get('window').width * 30}
              height={280}
              chartConfig={chartConfig}
              verticalLabelRotation={30}
            />
          </View> : <Text style={styles.noDataText}>No data available</Text>}
        </ScrollView>
        <View style={styles.spacing} />
        <ScrollView horizontal>
          {tableData? <View style={styles.tableContainer}>
            <Table borderStyle={{ borderWidth: 2, borderColor: '#3498db' }}>
              <Row data={tableHead} style={styles.head} textStyle={styles.text} widthArr={[125, 50, 200]} />
              <Rows data={tableData} textStyle={StyleSheet.flatten(styles.text)} widthArr={[125, 50, 200]} />
            </Table>
          </View> : <Text style={styles.noDataText}>No data available</Text>}
        </ScrollView>
      </ScrollView>
    </View>
  );
};

// Define styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
  title: { textAlign: 'center', fontSize: 24, marginBottom: 20, fontWeight: '700', color: '#3498db' },
  chartScrollView: { marginBottom: 20 },
  spacing: { height: 20 }, // Adjust the height as needed
  chartContainer: { alignItems: 'center' },
  tableContainer: { flex: 1, flexDirection: 'row' },
  head: { height: 40, backgroundColor: '#85c1e9' },
  text: { margin: 6, color: '#000', textAlign: 'center', justifyContent: 'center', fontWeight: '400' },
  noDataText: { textAlign: 'center', fontSize: 18, color: '#3498db', marginTop: 20 }
});

export default DataTableScreen;
