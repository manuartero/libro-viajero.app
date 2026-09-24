type BackupIconProps = {
  size?: number;
};

function Tray({ size = 22, arrow }: BackupIconProps & { arrow: string }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="square"
    >
      <path d="M11 3v10" />
      <path d={arrow} />
      <path d="M3.5 15v3.5h15V15" />
    </svg>
  );
}

export function DownloadIcon({ size }: BackupIconProps) {
  return <Tray size={size} arrow="M6.5 9l4.5 4.5L15.5 9" />;
}

export function UploadIcon({ size }: BackupIconProps) {
  return <Tray size={size} arrow="M6.5 7.5L11 3l4.5 4.5" />;
}
