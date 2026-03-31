'use client'
import dynamic from 'next/dynamic'
const Component = dynamic(() => import('../../src/page-components/ResultsPage'), { ssr: false })
export default function Page() { return <Component /> }
