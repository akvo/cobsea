import Link from 'next/link';
import Image from 'next/image';

export const TopBar = () => {
	return (
		<div className='topbar'>
			<div className='container'>
				<Link href='/'>
					<a>
            <span className="unep">
              <Image src="/unep.svg" alt="UNEP" width={62} height={46} />
            </span>
						<Image src='/cobsea.svg' alt='COBSEA' width={162} height={42} />
					</a>
				</Link>
				<nav>
					<Link href='/knowledge-library'>Knowledge library</Link>
					&nbsp;|&nbsp;
          <Link href="/research/database">Research database</Link>
				</nav>
			</div>
		</div>
	);
};

export default function Layout({ children }) {
	return (
		<>
			<TopBar />
			<main>{children}</main>
		</>
	);
}
