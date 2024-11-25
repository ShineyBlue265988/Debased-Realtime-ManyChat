import { Mail, Heart, Award, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';
import { Avatar, Identity } from '@coinbase/onchainkit/identity';
import VerifiedBadge from '../components/icons/bluebadge.jpg'
import BronzeBadge from '../components/icons/bronze.jpg'
import SilverBadge from '../components/icons/silver.jpg'
import GoldBadge from '../components/icons/gold.jpg'
import AdminBadge from '../components/icons/admin.jpg'
import { Card, CardContent, CardHeader } from '@/components/ui/card';
// import ProgressBar from 'react-progressbar';
import { Progress } from '../components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '../lib/utils';
const BADGES = [
    {
        type: 'verified',
        label: 'Verified',
        icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
        condition: 'Verified member',
        className: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-md',
        badgeimage: VerifiedBadge
    },
    {
        type: 'bronze',
        label: 'Bronze',
        icon: <Award className="w-3 h-3 mr-1" />,
        condition: '100+ messages & 50+ likes',
        className: 'bg-amber-700/10 text-amber-700 hover:bg-amber-700/20 text-md',
        badgeimage: BronzeBadge
    },
    {
        type: 'silver',
        label: 'Silver',
        icon: <Award className="w-3 h-3 mr-1" />,
        condition: '500+ messages & 200+ likes',
        className: 'bg-slate-400/10 text-slate-400 hover:bg-slate-400/20 text-md',
        badgeimage: SilverBadge
    },
    {
        type: 'gold',
        label: 'Gold',
        icon: <Award className="w-3 h-3 mr-1" />,
        condition: '1000+ messages & 500+ likes',
        className: 'bg-yellow-400/10 text-yellow-600 hover:bg-yellow-600/20 text-md',
        badgeimage: GoldBadge
    },
    {
        type: 'admin',
        label: 'Admin',
        icon: <Shield className="w-3 h-3 mr-1" />,
        condition: 'Administrator',
        className: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 text-md',
        badgeimage: AdminBadge
    },
];



const Profile = ({ username, walletAddress }) => {
    console.log("Profile Wallet Address", walletAddress);
    const stats = {
        messages: 1234,
        likes: 789,
        currentLevel: 0,
        nextLevelThreshold: 2000,
        progress: 67, // Current progress percentage to next level
    };

    return (
        <div className="container max-w-4xl mx-auto bg-white">
            <Card className="relative overflow-hidden max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
                <div className="absolute top-0  h-32 " />

                <CardHeader className="">
                    <div className="flex flex-col items-center space-y-4 bg-white">
                        <Identity
                            schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
                            address={walletAddress}
                            className='!bg-white w-30 h-30'
                        >
                            <Avatar className='bg-white w-20 h-20 flex items-center justify-center' />
                        </Identity>

                        <div className="text-center">
                            <h1 className="text-2xl font-bold">{username}</h1>
                            {/* <p className="text-muted-foreground">Senior Developer</p> */}
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="px-4 text-xl">
                                <img src={VerifiedBadge} alt="Badge" className="w-8 h-8 mr-2" />
                                Level {stats.currentLevel}
                            </Badge>
                            <Badge variant="outline" className="px-4 text-xl">Basic Member</Badge>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                        <Card>
                            <CardContent className="">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-md font-medium">Messages</span>
                                    </div>
                                    <span className="text-2xl font-bold">{stats.messages}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Heart className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-md font-medium">Likes</span>
                                    </div>
                                    <span className="text-2xl font-bold">{stats.likes}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mt-6">
                        <CardContent className="pt-6">
                            <div className="space-y-2">
                                <div className="flex  content-space-between items-center justify-between">
                                    {/* <span className="text-sm font-medium">Next Level Progress</span> */}
                                    {/* <div className="flex  text-md text-muted-foreground"> */}
                                            <span className='text-blue-500'>Level {stats.currentLevel}</span>
                                            {/* <ArrowRight className="w-4 h-4 mx-2 flex items-center" /> */}
                                            <span className=''>Level {stats.currentLevel + 1}</span>
                                    {/* </div> */}
                                </div>
                                <Progress
                                    value={stats.progress}
                                    className="h-3 [&>div]:bg-blue-500 bg-gray-200"
                                />
                                <p className="text-xs text-muted-foreground text-right">
                                    {stats.progress}% Complete
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">Badge Requirements</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                            {BADGES.map((badge) => (
                                <Card key={badge.type} className="bg-muted/50">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="">
                                            <div className="flex items-center space-x-2">
                                                <Badge
                                                    variant="outline"
                                                    className={cn("px-2", badge.className)}
                                                >
                                                    {badge.icon}
                                                    {badge.label}
                                                </Badge>
                                            </div>
                                            <p className="text-md text-muted-foreground mt-2">
                                                {badge.condition}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <img src={badge.badgeimage} alt={badge.label} className="w-14 h-14" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        <p>Member since January 2024</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
export default Profile;