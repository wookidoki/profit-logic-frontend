import styled from 'styled-components';

type Zone = 'GREEN' | 'YELLOW' | 'RED';

interface Props {
  zone: Zone;
}

const zoneConfig: Record<Zone, { label: string; bg: string; color: string }> = {
  GREEN: { label: '안전', bg: '#d1fae5', color: '#065f46' },
  YELLOW: { label: '주의', bg: '#fef3c7', color: '#92400e' },
  RED: { label: '위험', bg: '#fee2e2', color: '#991b1b' },
};

export default function ZoneBadge({ zone }: Props) {
  const config = zoneConfig[zone];
  return (
    <Badge $bg={config.bg} $color={config.color}>
      {config.label}
    </Badge>
  );
}

const Badge = styled.span<{ $bg: string; $color: string }>`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;
