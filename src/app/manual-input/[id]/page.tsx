import { ManualAnalysisDetailClient } from "@/app/manual-input/[id]/manual-analysis-detail-client";

export default function ManualAnalysisDetailPage({ params }: { params: { id: string } }) {
  return <ManualAnalysisDetailClient id={params.id} />;
}
