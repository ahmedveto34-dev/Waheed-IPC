import React from 'react';
import { PolicyAnalysisResult } from '../types';
import { A4FinalReviewDocument } from './A4FinalReviewDocument';

interface PrintableReportProps {
  data: PolicyAnalysisResult;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ data }) => {
  return (
    <div id="printable-a4-document">
      <A4FinalReviewDocument data={data} isPrintOnly={true} />
    </div>
  );
};
