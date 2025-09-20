import React from 'react';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { AuditCard } from './report';

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 12,
    fontFamily: 'Helvetica'
  },
  header: {
    fontSize: 18,
    marginBottom: 16,
    fontWeight: 700
  },
  section: {
    marginBottom: 12
  },
  badge: {
    marginTop: 8,
    padding: 8,
    borderRadius: 4
  }
});

const badgeColors: Record<string, string> = {
  green: '#38A169',
  amber: '#D69E2E',
  red: '#E53E3E'
};

export async function renderAuditCardPdf(card: AuditCard) {
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{card.title}</Text>
        <View style={styles.section}>
          <Text>Run ID: {card.runId}</Text>
          <Text>Generated: {new Date(card.createdAt).toLocaleString()}</Text>
        </View>
        <View style={styles.section}>
          <Text>Inputs</Text>
          {card.inputs.map((input) => (
            <Text key={input}>• {input}</Text>
          ))}
        </View>
        <View style={styles.section}>
          <Text>Metrics Snapshot</Text>
          <Text>Selection variance: {card.metrics.variance.toFixed(3)}</Text>
          <Text>Variance target: {card.metrics.varianceTarget.toFixed(3)}</Text>
          <Text>Status: {card.metrics.statusRibbon.toUpperCase()}</Text>
        </View>
        <View style={styles.section}>
          <Text>Mitigations</Text>
          {card.mitigations.map((mitigation) => (
            <Text key={mitigation}>• {mitigation}</Text>
          ))}
        </View>
        <View style={styles.section}>
          <Text>Residual Risks</Text>
          {card.residualRisks.map((risk) => (
            <Text key={risk}>• {risk}</Text>
          ))}
        </View>
        <View style={[styles.section, styles.badge, { backgroundColor: badgeColors[card.badgeColor] }] }>
          <Text style={{ color: '#fff' }}>Status Ribbon: {card.badgeColor.toUpperCase()}</Text>
        </View>
      </Page>
    </Document>
  );

  const blob = await pdf(doc).toBuffer();
  return blob;
}
