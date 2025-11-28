import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StoryProgress } from './StoryProgress';
import { StoryCard } from './StoryCard';
import type { ShareableCard } from '../../types/wrappedStories';
import '@styles/WrappedStories.css';
import '@styles/WrappedStories-responsive.css';

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
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const difference = touchStartXRef.current - touchEndX;
    const threshold = 50; // pixels

    if (Math.abs(difference) > threshold) {
      if (difference > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }

    touchStartXRef.current = null;
  };

  // Start auto-play on mount and restart when card changes if autoplay is active
  useEffect(() => {
    if (isAutoPlaying) {
      startAutoPlay();
    }

    return () => clearAutoPlayTimer();
  }, [currentCardIndex, isAutoPlaying, startAutoPlay, clearAutoPlayTimer]);

  return (
    <div className="wrapped-stories-container">
      <StoryProgress
        currentCardIndex={currentCardIndex}
        totalCards={totalCards}
        onJumpToCard={handleJumpToCard}
        isAutoPlaying={isAutoPlaying}
        autoPlayDuration={autoPlayDuration}
        isNavigatingBackward={isNavigatingBackward}
      />

      <div
        className="story-viewport"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
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
          />
        ))}
      </div>

      <div className="story-controls">
        <button
          className="control-button prev-button"
          onClick={handlePrevious}
          aria-label="Previous card"
          title="Previous card"
        >
          ←
        </button>

        <button
          className={`control-button autoplay-button ${isAutoPlaying ? 'playing' : ''}`}
          onClick={handleToggleAutoPlay}
          aria-label={isAutoPlaying ? 'Pause auto-play' : 'Start auto-play'}
          title={isAutoPlaying ? 'Pause' : 'Play'}
        >
          {isAutoPlaying ? '⏸' : '►'}
        </button>

        <button
          className="control-button next-button"
          onClick={handleNext}
          aria-label="Next card"
          title="Next card"
        >
          →
        </button>
      </div>

      <div className="story-info">
        Card {currentCardIndex + 1} of {totalCards}
      </div>
    </div>
  );
};
