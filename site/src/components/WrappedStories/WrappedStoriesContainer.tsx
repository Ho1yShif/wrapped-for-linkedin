import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StoryCard } from '@components/WrappedStories/StoryCard';
import type { ShareableCard } from '@/types/wrappedStories';
import '@styles/WrappedStories.css';

interface WrappedStoriesContainerProps {
  cards: ShareableCard[];
  autoPlayDuration?: number; // milliseconds
}

export const WrappedStoriesContainer: React.FC<WrappedStoriesContainerProps> = ({
  cards,
  autoPlayDuration = 5000,
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [userManuallyPaused, setUserManuallyPaused] = useState(false);
  const [isNavigatingBackward, setIsNavigatingBackward] = useState(false);
  const [swipeArrowDirection, setSwipeArrowDirection] = useState<'left' | 'right' | null>(null);
  const [isPressHolding, setIsPressHolding] = useState(false);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swipeArrowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousCardIndexRef = useRef(0);

  // Create refs for all cards for PDF export
  const cardRefsRef = useRef<React.RefObject<HTMLDivElement>[]>([]);

  // Initialize card refs array
  if (cardRefsRef.current.length !== cards.length) {
    cardRefsRef.current = Array.from({ length: cards.length }, (_, i) =>
      cardRefsRef.current[i] || React.createRef<HTMLDivElement>()
    );
  }

  // Validate we have cards
  if (!cards || cards.length === 0) {
    return null;
  }

  const totalCards = cards.length;

  // Extract summary metrics from the year-summary card to pass to all cards
  const yearSummaryCard = cards.find(card => card.type === 'year-summary');
  const summaryMetrics = yearSummaryCard
    ? {
        impressions: yearSummaryCard.data.impressions,
        membersReached: yearSummaryCard.data.membersReached,
      }
    : { impressions: '0', membersReached: '0' };

  // Clear auto-play timer
  const clearAutoPlayTimer = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  }, []);

  // Start auto-play
  const startAutoPlay = useCallback(() => {
    clearAutoPlayTimer();
    setIsAutoPlaying(true);

    autoPlayTimerRef.current = setTimeout(() => {
      setCurrentCardIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex >= totalCards) {
          return 0;  // Cycle back to beginning
        }
        return nextIndex;
      });
    }, autoPlayDuration);
  }, [totalCards, autoPlayDuration, clearAutoPlayTimer]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    setCurrentCardIndex(prev => {
      const nextIndex = prev + 1;
      if (nextIndex >= totalCards) return 0;  // Cycle to beginning
      previousCardIndexRef.current = prev;
      setIsNavigatingBackward(false);
      return nextIndex;
    });
    clearAutoPlayTimer();
    // Continue autoplay unless manually paused
    if (!userManuallyPaused) {
      setIsAutoPlaying(true);
    }
  }, [totalCards, clearAutoPlayTimer, userManuallyPaused]);

  const handlePrevious = useCallback(() => {
    setCurrentCardIndex(prev => {
      const prevIndex = prev - 1;
      if (prevIndex < 0) return totalCards - 1;  // Cycle to end
      previousCardIndexRef.current = prev;
      setIsNavigatingBackward(true);
      return prevIndex;
    });
    clearAutoPlayTimer();
    // Continue autoplay unless manually paused
    if (!userManuallyPaused) {
      setIsAutoPlaying(true);
    }
  }, [totalCards, clearAutoPlayTimer, userManuallyPaused]);

  const handleJumpToCard = useCallback((index: number) => {
    if (index >= 0 && index < totalCards) {
      setCurrentCardIndex(prevIndex => {
        setIsNavigatingBackward(index < prevIndex);
        previousCardIndexRef.current = prevIndex;
        return index;
      });
      clearAutoPlayTimer();
      // Continue autoplay unless manually paused
      if (!userManuallyPaused) {
        setIsAutoPlaying(true);
      }
    }
  }, [totalCards, clearAutoPlayTimer, userManuallyPaused]);

  const handleToggleAutoPlay = useCallback(() => {
    if (isAutoPlaying) {
      clearAutoPlayTimer();
      setIsAutoPlaying(false);
      setUserManuallyPaused(true);
    } else {
      setUserManuallyPaused(false);
      startAutoPlay();
    }
  }, [isAutoPlaying, clearAutoPlayTimer, startAutoPlay]);

  // Pause autoplay callback to be called from child components (e.g., ShareButton)
  const handlePauseAutoPlay = useCallback(() => {
    clearAutoPlayTimer();
    setIsAutoPlaying(false);
    setUserManuallyPaused(true);
  }, [clearAutoPlayTimer]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'Escape':
          clearAutoPlayTimer();
          setIsAutoPlaying(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious, clearAutoPlayTimer]);

  // Touch/swipe handling
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number | null>(null);

  // Clear swipe arrow animation
  const clearSwipeArrowTimer = useCallback(() => {
    if (swipeArrowTimerRef.current) {
      clearTimeout(swipeArrowTimerRef.current);
      swipeArrowTimerRef.current = null;
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    touchStartTimeRef.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null || touchStartTimeRef.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const touchDuration = Date.now() - touchStartTimeRef.current;

    const horizontalDifference = touchStartXRef.current - touchEndX;
    const verticalDifference = Math.abs(touchStartYRef.current - touchEndY);

    const swipeThreshold = 50; // pixels for swipe
    const tapThreshold = 10; // pixels for tap
    const tapDurationThreshold = 300; // milliseconds

    // Detect swipe (significant horizontal movement)
    if (Math.abs(horizontalDifference) > swipeThreshold && verticalDifference < swipeThreshold) {
      if (horizontalDifference > 0) {
        setSwipeArrowDirection('left');
        handleNext();
      } else {
        setSwipeArrowDirection('right');
        handlePrevious();
      }

      // Clear previous timer
      clearSwipeArrowTimer();

      // Hide arrow after animation completes
      swipeArrowTimerRef.current = setTimeout(() => {
        setSwipeArrowDirection(null);
      }, 600);
    }
    // Detect tap (minimal movement and quick duration)
    else if (
      Math.abs(horizontalDifference) < tapThreshold &&
      verticalDifference < tapThreshold &&
      touchDuration < tapDurationThreshold
    ) {
      // Get viewport element for width calculation
      const viewportElement = e.currentTarget as HTMLElement;
      const viewportWidth = viewportElement.offsetWidth;
      const tapXPosition = touchStartXRef.current;
      const midpoint = viewportWidth / 2;

      // Tap on right side = next, tap on left side = previous
      if (tapXPosition > midpoint) {
        handleNext();
      } else {
        handlePrevious();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchStartTimeRef.current = null;
  };

  // Press-and-hold to pause (Instagram stories style)
  const handlePointerDown = useCallback(() => {
    pressHoldTimerRef.current = setTimeout(() => {
      setIsPressHolding(true);
      clearAutoPlayTimer();
      setIsAutoPlaying(false);
    }, 200); // 200ms threshold to distinguish from tap
  }, [clearAutoPlayTimer]);

  const handlePointerUp = useCallback(() => {
    // Clear the press-hold timer if it hasn't fired yet
    if (pressHoldTimerRef.current) {
      clearTimeout(pressHoldTimerRef.current);
      pressHoldTimerRef.current = null;
    }

    // If we were holding, resume autoplay
    if (isPressHolding) {
      setIsPressHolding(false);
      setUserManuallyPaused(false);
      startAutoPlay();
    }
  }, [isPressHolding, startAutoPlay]);

  // Start auto-play on mount and restart when card changes if autoplay is active
  useEffect(() => {
    if (isAutoPlaying) {
      startAutoPlay();
    }

    return () => {
      clearAutoPlayTimer();
      clearSwipeArrowTimer();
    };
  }, [currentCardIndex, isAutoPlaying, startAutoPlay, clearAutoPlayTimer, clearSwipeArrowTimer]);

  const currentCard = cards[currentCardIndex];
  const viewportClassName = `story-viewport${currentCard?.type === 'peak-performer' ? ' peak-performer-viewport' : ''}`;

  return (
    <div className="wrapped-stories-container">
      {/* Left arrow - positioned on left side of viewport */}
      <button
        className="side-nav-button side-nav-prev"
        onClick={handlePrevious}
        aria-label="Previous card"
        title="Previous card"
      >
        ←
      </button>

      <div
        className={viewportClassName}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Click zones for desktop navigation */}
        <div
          className="click-zone click-zone-left"
          onClick={handlePrevious}
          aria-label="Previous card"
        />
        <div
          className="click-zone click-zone-right"
          onClick={handleNext}
          aria-label="Next card"
        />

        {/* Swipe Arrow Indicators */}
        {swipeArrowDirection && (
          <>
            {swipeArrowDirection === 'left' && (
              <div className="swipe-arrow swipe-arrow-left">→</div>
            )}
            {swipeArrowDirection === 'right' && (
              <div className="swipe-arrow swipe-arrow-right">←</div>
            )}
          </>
        )}

        {/* Render all cards - CSS makes only active one visible */}
        {cards.map((card, index) => (
          <StoryCard
            key={card.id}
            card={card}
            isActive={index === currentCardIndex}
            cardIndex={index}
            cardRef={cardRefsRef.current[index]}
            allCards={cardRefsRef.current}
            summaryMetrics={summaryMetrics}
            onPauseAutoplay={handlePauseAutoPlay}
            currentCardIndex={currentCardIndex}
            totalCards={totalCards}
            onJumpToCard={handleJumpToCard}
            isAutoPlaying={isAutoPlaying}
            autoPlayDuration={autoPlayDuration}
            isNavigatingBackward={isNavigatingBackward}
          />
        ))}
      </div>

      {/* Right arrow - positioned on right side of viewport */}
      <button
        className="side-nav-button side-nav-next"
        onClick={handleNext}
        aria-label="Next card"
        title="Next card"
      >
        →
      </button>

      {/* Pause button stays centered below */}
      <div className="story-controls">
        <button
          className={`control-button autoplay-button ${isAutoPlaying ? 'playing' : ''}`}
          onClick={handleToggleAutoPlay}
          aria-label={isAutoPlaying ? 'Pause auto-play' : 'Start auto-play'}
          title={isAutoPlaying ? 'Pause' : 'Play'}
        >
          {isAutoPlaying ? '⏸' : '►'}
        </button>
      </div>

      <div className="story-info">
        Card {currentCardIndex + 1} of {totalCards}
      </div>
    </div>
  );
};
