import { Router } from 'express';
import type { Response } from 'express';
// 1. Import the global shared singleton instance instead of creating a new one
import { prisma } from '../prisma.js'; // Adjust relative path to point to your new prisma.ts file
import type { AuthRequest } from '../middleware/auth.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Sync Watch Progress Position
router.post('/progress', requireAuth, async (req: AuthRequest, res: Response) => {
  const { tmdbId, stoppedAtSeconds, durationSeconds } = req.body;
  const userId = req.userId!;
  
  // Guard against missing division input properties
  if (!durationSeconds) {
    return res.status(400).json({ error: 'Duration seconds parameter is required' });
  }
  
  const isFinished = (Number(stoppedAtSeconds) / Number(durationSeconds)) > 0.9;

  try {
    const record = await prisma.watchHistory.upsert({
      where: { userId_tmdbId: { userId, tmdbId: Number(tmdbId) } },
      update: { stoppedAtSeconds: Number(stoppedAtSeconds), isFinished, updatedAt: new Date() },
      create: { userId, tmdbId: Number(tmdbId), stoppedAtSeconds: Number(stoppedAtSeconds), durationSeconds: Number(durationSeconds), isFinished }
    });
    return res.status(200).json({ success: true, record });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to record tracking sync timestamp' });
  }
});

// Fetch Saved Offline Resuming Mark
router.get('/progress/:tmdbId', requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const tmdbId = Number(req.params.tmdbId);

  try {
    const historyItem = await prisma.watchHistory.findUnique({
      where: { userId_tmdbId: { userId, tmdbId } }
    });
    return res.status(200).json({ stoppedAtSeconds: historyItem ? historyItem.stoppedAtSeconds : 0 });
  } catch (error) {
    return res.status(500).json({ error: 'Database fetch failure' });
  }
});

// Add to Watch Later
router.post('/watch-later', requireAuth, async (req: AuthRequest, res: Response) => {
  const { tmdbId } = req.body;
  const userId = req.userId!;

  try {
    await prisma.watchLater.upsert({
      where: { userId_tmdbId: { userId, tmdbId: Number(tmdbId) } },
      update: {},
      create: { userId, tmdbId: Number(tmdbId) }
    });
    return res.status(201).json({ success: true, message: 'Added to watch list' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to toggle bookmark save state' });
  }
});

// Fetch User Dashboard Playlists (Watch Later & History Lists)
router.get('/dashboard', requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  try {
    // Query Neon database for user relation profiles simultaneously
    const [watchLaterList, watchHistoryList] = await Promise.all([
      prisma.watchLater.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.watchHistory.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      })
    ]);

    return res.status(200).json({
      success: true,
      watchLater: watchLaterList,
      // Filter out movies they finished watching from the immediate "Continue Watching" queue list
      continueWatching: watchHistoryList.filter((item) => !item.isFinished)
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to aggregate library dashboard payload lists' });
  }
});


export default router;
