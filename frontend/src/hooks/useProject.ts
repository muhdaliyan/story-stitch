/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, type ChangeEvent, useEffect } from 'react';
import type { ProjectData, Scene, StepId } from '../types';

export function useProject() {
  const [projects, setProjects] = useState<ProjectData[]>(() => {
    const saved = localStorage.getItem('storystitch_projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(true);

  // Project creation form state
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectFormat, setNewProjectFormat] = useState<'short' | 'long'>('short');
  const [newProjectFrequency, setNewProjectFrequency] = useState(10);
  const [newProjectDuration, setNewProjectDuration] = useState(60);

  // Active project working state
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [furthestStep, setFurthestStep] = useState<StepId>(1);
  const [concept, setConcept] = useState(
    'A lone astronomer discovers a signal from a distant world.\nShe builds a machine to respond —\nand receives a reply that changes everything.'
  );
  const [scenes, setScenes] = useState<Scene[]>([]);

  // File upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingForScene, setUploadingForScene] = useState<{ id?: string; type: 'image' | 'video' | 'audio' } | null>(null);
  const [pendingBatchFiles, setPendingBatchFiles] = useState<{ file: File; id: string; url: string }[]>([]);

  // Step 6 state
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');

  const activeProject = projects.find(p => p.id === activeProjectId);

  // Persist to localStorage
  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem('storystitch_projects', JSON.stringify(projects));
    }
  }, [projects, activeProjectId]);

  // Sync working state back to projects
  useEffect(() => {
    saveCurrentProgress();
  }, [concept, scenes, currentStep, furthestStep, videoTitle, videoDescription]);

  // Track furthest step reached
  useEffect(() => {
    if (currentStep > furthestStep) setFurthestStep(currentStep);
  }, [currentStep]);

  const saveCurrentProgress = () => {
    if (!activeProjectId) return;
    setProjects(prev =>
      prev.map(p =>
        p.id === activeProjectId
          ? {
              ...p,
              concept,
              scenes,
              currentStep,
              furthestStep: Math.max(p.furthestStep || 1, furthestStep),
              videoTitle,
              videoDescription,
            }
          : p
      )
    );
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    const newProject: ProjectData = {
      id: `proj-${Date.now()}`,
      name: newProjectName,
      format: newProjectFormat,
      sceneFrequency: Math.max(5, newProjectFrequency),
      targetDuration:
        newProjectFormat === 'short'
          ? Math.min(60, newProjectDuration)
          : Math.min(300, newProjectDuration),
      concept:
        'A lone astronomer discovers a signal from a distant world.\nShe builds a machine to respond —\nand receives a reply that changes everything.',
      scenes: [],
      currentStep: 1,
      furthestStep: 1,
      videoTitle: '',
      videoDescription: '',
    };
    setProjects([newProject, ...projects]);
    setActiveProjectId(newProject.id);
    setConcept(newProject.concept);
    setScenes(newProject.scenes);
    setCurrentStep(newProject.currentStep);
    setVideoTitle(newProject.videoTitle);
    setVideoDescription(newProject.videoDescription);
    setIsProjectModalOpen(false);
    setNewProjectName('');
  };

  const handleSelectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setActiveProjectId(project.id);
      setConcept(project.concept);
      setScenes(project.scenes);
      setCurrentStep(project.currentStep);
      setFurthestStep(project.furthestStep || project.currentStep);
      setVideoTitle(project.videoTitle);
      setVideoDescription(project.videoDescription);
      setIsProjectModalOpen(false);
    }
  };

  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjects(projects.filter(p => p.id !== projectId));
    if (activeProjectId === projectId) setActiveProjectId(null);
  };

  const handleUploadAsset = (sceneId?: string, type: 'image' | 'video' | 'audio' = 'image') => {
    setUploadingForScene({ id: sceneId, type });
    if (fileInputRef.current) {
      fileInputRef.current.accept =
        type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'audio/*';
      fileInputRef.current.click();
    }
  };

  const onFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && uploadingForScene) {
      // Check file sizes
      const tooLarge = files.some(file => file.size > 100 * 1024 * 1024);
      if (tooLarge) {
        alert('One or more files are too large. Please upload files smaller than 100MB.');
        return;
      }

      // If it's a batch upload (no specific scene id) and multiple files, show modal
      if (!uploadingForScene.id && files.length > 1) {
        const pending = files.map(file => ({
          file,
          id: Math.random().toString(36).substr(2, 9),
          url: URL.createObjectURL(file)
        }));
        setPendingBatchFiles(pending);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      try {
        setScenes(prev => {
          const newScenes = [...prev];
          let startIndex = 0;

          if (uploadingForScene.id) {
            // Find the index of the scene to start from
            startIndex = newScenes.findIndex(s => s.id === uploadingForScene.id);
            if (startIndex === -1) startIndex = 0;
          }

          // Process each file
          files.forEach((file, i) => {
            const targetIndex = startIndex + i;
            if (targetIndex < newScenes.length) {
              const url = URL.createObjectURL(file);
              const scene = { ...newScenes[targetIndex] };

              if (uploadingForScene.type === 'image') scene.imageUrl = url;
              else if (uploadingForScene.type === 'video') scene.animationVideoUrl = url;
              else if (uploadingForScene.type === 'audio') scene.voiceoverAudioUrl = url;

              newScenes[targetIndex] = scene;
            }
          });

          return newScenes;
        });
      } catch (err) {
        console.error('Failed to process files', err);
        alert('Failed to process files. They might be too large for browser memory.');
      } finally {
        setUploadingForScene(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleCommitBatch = () => {
    if (pendingBatchFiles.length === 0) return;

    setScenes(prev => {
      const newScenes = [...prev];
      pendingBatchFiles.forEach((item, i) => {
        if (i < newScenes.length) {
          const scene = { ...newScenes[i] };
          if (uploadingForScene?.type === 'image') scene.imageUrl = item.url;
          else if (uploadingForScene?.type === 'video') scene.animationVideoUrl = item.url;
          else if (uploadingForScene?.type === 'audio') scene.voiceoverAudioUrl = item.url;
          newScenes[i] = scene;
        }
      });
      return newScenes;
    });

    setPendingBatchFiles([]);
    setUploadingForScene(null);
  };

  const handleCancelBatch = () => {
    // Clean up URLs
    pendingBatchFiles.forEach(item => URL.revokeObjectURL(item.url));
    setPendingBatchFiles([]);
    setUploadingForScene(null);
  };

  const handleReverseBatch = () => {
    setPendingBatchFiles(prev => [...prev].reverse());
  };

  const handleReorderBatch = (newOrder: { file: File; id: string; url: string }[]) => {
    setPendingBatchFiles(newOrder);
  };

  const handleDownloadAsset = (url: string | undefined, filename: string) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    // State
    projects,
    activeProjectId,
    activeProject,
    isProjectModalOpen,
    setIsProjectModalOpen,
    newProjectName,
    setNewProjectName,
    newProjectFormat,
    setNewProjectFormat,
    newProjectFrequency,
    setNewProjectFrequency,
    newProjectDuration,
    setNewProjectDuration,
    currentStep,
    setCurrentStep,
    furthestStep,
    setFurthestStep,
    concept,
    setConcept,
    scenes,
    setScenes,
    fileInputRef,
    videoTitle,
    setVideoTitle,
    videoDescription,
    setVideoDescription,
    // Handlers
    handleCreateProject,
    handleSelectProject,
    handleDeleteProject,
    handleUploadAsset,
    onFileSelected,
    handleDownloadAsset,
    // Batch actions
    pendingBatchFiles,
    handleCommitBatch,
    handleCancelBatch,
    handleReverseBatch,
    handleReorderBatch,
  };
}
