'use client'
import dynamic from 'next/dynamic'
const LegalPage = dynamic(() => import('../../src/page-components/LegalPage'), { ssr: false })
export default function Page() { return <LegalPage type="privacy" /> }
