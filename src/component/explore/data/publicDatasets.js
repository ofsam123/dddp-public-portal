export const DEFAULT_PUBLIC_DATASET = 'projects-programmes'

export const PUBLIC_DATASETS = [
    { key: 'projects-programmes', label: 'Projects & Programmes', status: 'available', capabilities: ['headline', 'analysis', 'geography'] },
    { key: 'aap', label: 'Annual Action Plan', status: 'available', capabilities: ['headline', 'analysis', 'geography'] },
    { key: 'igf', label: 'Internally Generated Fund', status: 'pending', capabilities: [] },
    { key: 'meetings', label: 'Meetings', status: 'available', capabilities: ['headline', 'analysis', 'geography'] },
    { key: 'pwda-programmes', label: 'PWDAs Programmes', status: 'pending-year-rule', capabilities: ['geography'] },
]

export const getPublicDataset = (key) => (
    PUBLIC_DATASETS.find((dataset) => dataset.key === key)
    || PUBLIC_DATASETS.find((dataset) => dataset.key === DEFAULT_PUBLIC_DATASET)
)

export const isPublicDatasetKey = (key) => PUBLIC_DATASETS.some((dataset) => dataset.key === key)
