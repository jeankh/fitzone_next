import dynamic from 'next/dynamic'
const Component = dynamic(() => import('../../src/page-components/CheckoutPage'))
export default function Page() { return <Component /> }
