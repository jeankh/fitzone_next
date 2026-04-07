import dynamic from 'next/dynamic'
const Component = dynamic(() => import('../../src/page-components/BooksPage'))
export default function Page() { return <Component /> }
