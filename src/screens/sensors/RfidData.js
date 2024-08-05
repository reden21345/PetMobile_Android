import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { Table, Row, Rows } from 'react-native-table-component';
import { PieChart } from 'react-native-chart-kit';
import axios from 'axios';
import baseURL from '../../../assets/common/baseurl';

const DataTableScreen = () => {
  const [tableHead, setTableHead] = useState(['UID', 'Time']);
  const [tableData, setTableData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(142, 68, 173, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${baseURL}/rfid-data`);
      const data = response.data;

      if (Array.isArray(data)) {
        // Sort data by timestamp in descending order
        const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const formattedData = sortedData.map(item => [
          item.uid,
          new Date(item.timestamp).toLocaleString(),
        ]);
        setTableData(formattedData);

        // Aggregate UIDs
        const uidCounts = sortedData.reduce((acc, item) => {
          acc[item.uid] = (acc[item.uid] || 0) + 1;
          return acc;
        }, {});

        // Prepare data for the chart
        const chartData = Object.keys(uidCounts).map((uid, index) => ({
          name: uid,
          population: uidCounts[uid],
          color: `rgba(142, 68, 173, ${1 - index / Object.keys(uidCounts).length})`,
          legendFontColor: '#7F7F7F',
          legendFontSize: 15,
        }));

        setChartData(chartData);
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
        <ActivityIndicator size="large" color="#8e44ad" />
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
      <Text style={styles.title}>Pet Identity History</Text>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.chartContainer}>
          <PieChart
            data={chartData}
            width={Dimensions.get('window').width - 16}
            height={220}
            chartConfig={chartConfig}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        </View>
        <View style={styles.spacing} />
        <View style={styles.tableContainer}>
          <Table borderStyle={{ borderWidth: 2, borderColor: '#8e44ad' }}>
            <Row data={tableHead} style={styles.head} textStyle={styles.text} widthArr={[185, 190]} />
            <Rows data={tableData} textStyle={StyleSheet.flatten(styles.text)} widthArr={[185, 190]} />
          </Table>
        </View>
      </ScrollView>
    </View>
  );
};

// Define styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff', width: '100%' },
  title: { textAlign: 'center', fontSize: 24, marginBottom: 20, fontWeight: '700', color: '#8e44ad' },
  chartContainer: { alignItems: 'center' },
  chartScrollView: { marginBottom: 20 },
  spacing: { height: 20 }, // Adjust the height as needed
  tableContainer: { flex: 1, flexDirection: 'row' },
  head: { height: 40, backgroundColor: '#d7bde2' },
  text: { margin: 6, color: '#000', textAlign: 'center', justifyContent: 'center', fontWeight: '400' },
  noDataText: { textAlign: 'center', fontSize: 18, color: '#8e44ad', marginTop: 20 }
});

export default DataTableScreen;
