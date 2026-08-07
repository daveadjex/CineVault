'use clients'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeroBanner from '@/components/HeroBanner';
import MediaGridSection from '@/components/MediaGridSection';
import { Search, Login, UserPlus, Menu, X, Sparkles, Vault, USer, LogOut} from 'lucide-react';

interface Movie {
    id: number;
    title: string;
    overview: string;
    backdrop_path: string;
    poster_path: string;
    vote_average?: number;
    release_date?: string;
    [key: string]: any;
}