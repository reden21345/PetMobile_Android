import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Table, Row, Rows } from 'react-native-table-component';

const TableComponent = ({ tableHead, tableData }) => {
    return (
        <View style={styles.tableContainer}>
        <Table borderStyle={{ borderWidth: 2, borderColor: '#f39c12' }}>
            <Row data={tableHead} style={styles.head} textStyle={styles.text} widthArr={[100, 80, 195]} />
            <Rows data={tableData} textStyle={styles.text} widthArr={[100, 80, 195]} />
        </Table>
        </View>
    );
};

const styles = StyleSheet.create({
    tableContainer: { flex: 1, flexDirection: 'row' },
    head: { height: 40, backgroundColor: '#FFD35A' },
    text: { margin: 6, color: '#000', textAlign: 'center', justifyContent: 'center', fontWeight: '400' },
});

export default TableComponent;
