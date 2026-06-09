import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleQueueUpdate } from './ce-do-core.js';

// Mock functions for dependency injection
const mockExtensionStorage = {
  get: vi.fn(),
  set: vi.fn()
};
const mockRenderLevelProgress = vi.fn();
const mockSwitchAdoptable = vi.fn();
const mockDisplayToast = vi.fn();


describe('Tests for functions in ce-do-core.js content script', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('handleQueueUpdate', () => {
    it('should update the queue and navigate to the next adoptable when the current level is greater than or equal to the target level', async () => {
      // Mock test data
      const queue = [
        { id: 1, target: 30 },
        { id: 2, target: 30 },
        { id: 3, target: 30 },
      ];
      const queueHistory = [];
      const currentLevel = 30;
      mockExtensionStorage.get.mockReturnValue({ queue, queueHistory });

      // Call the function with mock data and dependencies
      await handleQueueUpdate(
        currentLevel,
        mockExtensionStorage,
        mockRenderLevelProgress,
        mockSwitchAdoptable,
        mockDisplayToast
      );

      // Check that the first adoptable in the queue was removed
      expect(mockExtensionStorage.set).toHaveBeenCalledWith(
        {
          queue: [
            { id: 2, target: 30 },
            { id: 3, target: 30 },
          ],
          queueHistory: [
            { id: 1, target: 30 },
          ]
        }
      );
      // Check that switchAdoptable was called with the next adoptable ID in the queue
      expect(mockSwitchAdoptable).toHaveBeenCalledWith(2);
    });

    it('should not update the queue if the current level is less than the target level', async () => {
      // Mock test data
      const queue = [
        { id: 1, target: 30 },
      ];
      const queueHistory = [];
      const currentLevel = 10;
      mockExtensionStorage.get.mockReturnValue({ queue, queueHistory });

      // Call the function with mock data and dependencies
      await handleQueueUpdate(
        currentLevel,
        mockExtensionStorage,
        mockRenderLevelProgress,
        mockSwitchAdoptable,
        mockDisplayToast
      );

      // Check that the queue was not updated
      expect(mockExtensionStorage.set).not.toHaveBeenCalled();
    });

    it('should navigate to the "done" page when the queue is empty', async () => {
      // Mock test data
      const queue = [
        { id: 1, target: 30 },
      ];
      const queueHistory = [];
      const currentLevel = 30;
      mockExtensionStorage.get.mockReturnValue({ queue, queueHistory });

      // Call the function with mock data and dependencies
      await handleQueueUpdate(
        currentLevel,
        mockExtensionStorage,
        mockRenderLevelProgress,
        mockSwitchAdoptable,
        mockDisplayToast
      );

      // Check that the queue is empty
      expect(mockExtensionStorage.set).toHaveBeenCalledWith({
        queue: [],
        queueHistory: [
          { id: 1, target: 30 },
        ]
      });
      // Check that the window location was set to the "done" page
      expect(window.location).toContain('?act=choose#done');
    });
  });
});