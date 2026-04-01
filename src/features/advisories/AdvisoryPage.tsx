import React from 'react';
import { FileText } from 'lucide-react';
import { useAppSelector } from '../../hooks';
import { Card, Badge, EmptyState } from '../../components/ui';

export const AdvisoryPage: React.FC = () => {
  const { advisories, loading } = useAppSelector((state) => state.advisories);

  if (advisories.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-16 w-16" />}
        title="No advisories"
        description="You'll see farming advisories and recommendations here."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Advisories</h1>
        <p className="text-sm text-gray-600 mt-1">
          Expert recommendations for your plots
        </p>
      </div>

      {/* Advisories List */}
      <div className="space-y-4">
        {advisories.map((advisory) => (
          <Card key={advisory.id}>
            <div className="flex items-start gap-4">
              <FileText className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {advisory.title}
                  </h3>
                  <Badge
                    variant={
                      advisory.severity === 'critical'
                        ? 'error'
                        : advisory.severity === 'high'
                          ? 'warning'
                          : 'info'
                    }
                  >
                    {advisory.severity}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  {advisory.description}
                </p>
                <div className="bg-primary-50 border-l-4 border-primary-500 p-3 rounded">
                  <p className="text-sm font-medium text-primary-900">
                    Recommended Action:
                  </p>
                  <p className="text-sm text-primary-800 mt-1">
                    {advisory.recommendedAction}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  {new Date(advisory.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};