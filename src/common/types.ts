export type YtDlpAssetNameArchitectureMap = Partial<Record<NodeJS.Architecture, string>>;
export type YtDlpAssetName = Partial<Record<NodeJS.Platform, YtDlpAssetNameArchitectureMap>>;
export type YtDlpBinPath = Partial<Record<NodeJS.Platform, string>>;
