import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StoryProgress } from './StoryProgress';
import { StoryCard } from './StoryCard';
import type { ShareableCard } from '../../types/wrappedStories';
import '../../styles/WrappedStories.css';

interface WrappedStoriesContainerProps {
  cards: ShareableCard[];
  autoPlayDuration?: number; // milliseconds
}

export const WrappedStoriesContainer: React.FC<WrappedStoriesContainerProps> = ({
  cards,
  autoPlayDuration = 5000,
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [userManuallyPaused, setUserManuallyPaused] = useState(false);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          setIsAutoPlaying(false);
          return prev;
        }
        return nextIndex;
      });
    }, autoPlayDuration);
  }, [totalCards, autoPlayDuration, clearAutoPlayTimer]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    setCurrentCardIndex(prev => {
      const nextIndex = prev + 1;
      if (nextIndex >= totalCards) return prev;
      return nextIndex;
    });
    clearAutoPlayTimer();
    // Only stop auto-play if not manually paused
    if (!userManuallyPaused) {
      setIsAutoPlaying(false);
    }
  }, [totalCards, clearAutoPlayTimer, userManuallyPaused]);

  const handlePrevious = useCallback(() => {
    setCurrentCardIndex(prev => {
      const prevIndex = prev - 1;
      if (prevIndex < 0) return 0;
      return prevIndex;
    });
    clearAutoPlayTimer();
    // Only stop auto-play if not manually paused
    if (!userManuallyPaused) {
      setIsAutoPlaying(false);
    }
  }, [clearAutoPlayTimer, userManuallyPaused]);

  const handleJumpToCard = useCallback((index: number) => {
    if (index >= 0 && index < totalCards) {
      setCurrentCardIndex(index);
      clearAutoPlayTimer();
      // Only stop auto-play if not manually paused
      if (!userManuallyPaused) {
        setIsAutoPlaying(false);
      }
    }
  }, [totalCards, clearAutoPlayTimer, userManuallyPaused]);

  const handleToggleAutoPlay = useCallback(() => {
    if (isAutoPlaying) {
      clearAutoPlayTimer();
      setIsAutoPlaying(false);
      setUserManuallyPaused(true);
    } else if (currentCardIndex < totalCards - 1) {
      setUserManuallyPaused(false);
      startAutoPlay();
    }
  }, [isAutoPlaying, currentCardIndex, totalCards, clearAutoPlayTimer, startAutoPlay]);

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

  // Start auto-play on mount if not last card
  useEffect(() => {
    if (currentCardIndex < totalCards - 1) {
      startAutoPlay();
    }

    return () => clearAutoPlayTimer();
  }, [currentCardIndex, totalCards, startAutoPlay, clearAutoPlayTimer]);

  return (
    <div className="wrapped-stories-container">
      <StoryProgress
        currentCardIndex={currentCardIndex}
        totalCards={totalCards}
        onJumpToCard={handleJumpToCard}
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
          />
        ))}
      </div>

      <div className="story-controls">
        <button
          className="control-button prev-button"
          onClick={handlePrevious}
          disabled={currentCardIndex === 0}
          aria-label="Previous card"
          title="Previous card"
        >
          ←
        </button>

        <button
          className={`control-button autoplay-button ${isAutoPlaying ? 'playing' : ''}`}
          onClick={handleToggleAutoPlay}
          disabled={currentCardIndex === totalCards - 1}
          aria-label={isAutoPlaying ? 'Pause auto-play' : 'Start auto-play'}
          title={isAutoPlaying ? 'Pause' : 'Play'}
        >
          {isAutoPlaying ? '⏸' : '►'}
        </button>

        <button
          className="control-button next-button"
          onClick={handleNext}
          disabled={currentCardIndex === totalCards - 1}
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
