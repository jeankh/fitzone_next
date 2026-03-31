'use client'
import dynamic from 'next/dynamic'
const NotFoundPage = dynamic(() => import('../src/page-components/NotFoundPage'), { ssr: false })
export default function NotFound() { return <NotFoundPage /> }
