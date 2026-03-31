'use client'
import dynamic from 'next/dynamic'
const Component = dynamic(() => import('../../src/page-components/BooksPage'), { ssr: false })
export default function Page() { return <Component /> }
