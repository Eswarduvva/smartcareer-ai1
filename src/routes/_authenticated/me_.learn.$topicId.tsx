import {createFileRoute,Outlet} from '@tanstack/react-router';
import {AppShell} from '@/components/AppShell';
export const Route=createFileRoute('/_authenticated/me_/learn/$topicId')({component:Layout});
function Layout(){return <AppShell><Outlet/></AppShell>;}