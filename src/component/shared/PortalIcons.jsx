import React from 'react'

const Icon = ({ children }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        {children}
    </svg>
)

export const ExternalArrowIcon = () => (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M6 14 14 6M8 6h6v6" />
    </svg>
)

export const EconomicIcon = () => (
    <Icon>
        <path d="M4 19.5h16M6.5 17v-4M11 17V9.5M15.5 17v-7M4.5 10.5l5-4 4 2.5 6-5" />
        <path d="m16.5 4 3-.2-.3 3" />
    </Icon>
)

export const CommunityIcon = () => (
    <Icon>
        <circle cx="12" cy="7" r="2.5" />
        <circle cx="5.5" cy="9.5" r="2" />
        <circle cx="18.5" cy="9.5" r="2" />
        <path d="M7.5 19v-1.5a4.5 4.5 0 0 1 9 0V19M2.5 18v-1a3.2 3.2 0 0 1 4-3.1M21.5 18v-1a3.2 3.2 0 0 0-4-3.1" />
    </Icon>
)

export const InfrastructureIcon = () => (
    <Icon>
        <path d="M3.5 20.5h17M5 20V8h6v12M11 20V4h8v16" />
        <path d="M7.5 11h1M7.5 14h1M14 7h2M14 10h2M14 13h2M14 16h2" />
    </Icon>
)

export const GovernanceIcon = () => (
    <Icon>
        <path d="m3 9 9-5 9 5M4 10h16M5.5 10v7.5M9.8 10v7.5M14.2 10v7.5M18.5 10v7.5M3 18.5h18M2.5 21h19" />
    </Icon>
)

export const EmergencyIcon = () => (
    <Icon>
        <path d="M12 3.5 20 7v5.5c0 4.4-3.2 7.2-8 8.5-4.8-1.3-8-4.1-8-8.5V7Z" />
        <path d="M12 8v5M12 16.5v.1" />
    </Icon>
)

export const MonitoringIcon = () => (
    <Icon>
        <rect x="5" y="4.5" width="14" height="16" rx="2" />
        <path d="M9 4.5V3h6v1.5M8.5 10.5l1.5 1.5 2.5-3M8.5 16h7" />
    </Icon>
)

export const AgricultureIcon = () => (
    <Icon>
        <path d="M12 21V10M12 14c-4.5 0-7-2.7-7-6.5 4.5 0 7 2.1 7 6.5ZM12 11c0-4.5 2.7-7 6.5-7 0 4.5-2.1 7-6.5 7Z" />
        <path d="M7 21h10" />
    </Icon>
)

export const ServicesIcon = () => (
    <Icon>
        <circle cx="12" cy="12" r="3" />
        <circle cx="5" cy="6" r="2" />
        <circle cx="19" cy="6" r="2" />
        <circle cx="5" cy="18" r="2" />
        <circle cx="19" cy="18" r="2" />
        <path d="m7 7.7 2.7 2.2M17 7.7l-2.7 2.2M7 16.3l2.7-2.2M17 16.3l-2.7-2.2" />
    </Icon>
)

export const FinanceIcon = () => (
    <Icon>
        <rect x="3.5" y="6" width="17" height="13" rx="2.5" />
        <path d="M3.5 9.5h17M16 14.5h2M7 6V4h9M8 15l2-2 2 1.5 3-3" />
    </Icon>
)

export const RegulationIcon = () => (
    <Icon>
        <path d="M12 3.5 20 7v5.5c0 4.4-3.2 7.2-8 8.5-4.8-1.3-8-4.1-8-8.5V7Z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
    </Icon>
)

export const ProgrammeIcon = () => (
    <Icon>
        <path d="M6 21V4M7 5h10l-2 3 2 3H7M4 21h6" />
    </Icon>
)

export const InvestmentIcon = () => (
    <Icon>
        <circle cx="7" cy="17" r="3" />
        <path d="M7 15.5v3M5.8 17h2.4M11 18.5h9M12 14l3-3 2 1.5 3-4.5" />
        <path d="m17.5 8 2.5-.2-.2 2.5" />
    </Icon>
)
