/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimatePresence, motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { STEPS } from './constants';

// Hooks
import { useProject } from './hooks/useProject';
import { useAI } from './hooks/useAI';

// Layout components
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ProjectModal } from './components/ProjectModal';
import { BatchUploadModal } from './components/BatchUploadModal';

// Step pages
import { StepConcept } from './components/steps/StepConcept';
import { StepScripting } from './components/steps/StepScripting';
import { StepVisuals } from './components/steps/StepVisuals';
import { StepAnimation } from './components/steps/StepAnimation';
import { StepVoiceover } from './components/steps/StepVoiceover';
import { StepFinalize } from './components/steps/StepFinalize';

export default function App() {
  const project = useProject();

  const ai = useAI({
    concept: project.concept,
    scenes: project.scenes,
    setScenes: project.setScenes,
    setCurrentStep: project.setCurrentStep,
    setVideoTitle: project.setVideoTitle,
    setVideoDescription: project.setVideoDescription,
    activeProjectSceneFrequency: project.activeProject?.sceneFrequency,
    activeProjectTargetDuration: project.activeProject?.targetDuration,
    activeProjectFormat: project.activeProject?.format,
  });

  return (
    <div className="relative h-[var(--fill-height)] w-[var(--fill-width)] flex overflow-hidden font-serif selection:bg-flame/20">
      {/* Project Modal */}
      <ProjectModal
        isOpen={project.isProjectModalOpen}
        projects={project.projects}
        activeProjectId={project.activeProjectId}
        newProjectName={project.newProjectName}
        setNewProjectName={project.setNewProjectName}
        newProjectFormat={project.newProjectFormat}
        setNewProjectFormat={project.setNewProjectFormat}
        newProjectFrequency={project.newProjectFrequency}
        setNewProjectFrequency={project.setNewProjectFrequency}
        newProjectDuration={project.newProjectDuration}
        setNewProjectDuration={project.setNewProjectDuration}
        onClose={() => project.setIsProjectModalOpen(false)}
        onCreateProject={project.handleCreateProject}
        onSelectProject={project.handleSelectProject}
        onDeleteProject={project.handleDeleteProject}
      />

      {/* Batch Upload Modal */}
      <BatchUploadModal
        files={project.pendingBatchFiles}
        onReorder={project.handleReorderBatch}
        onReverse={project.handleReverseBatch}
        onConfirm={project.handleCommitBatch}
        onCancel={project.handleCancelBatch}
      />

      {/* Atmosphere Gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full atmosphere-top-left" />
        <div className="absolute top-0 right-0 w-full h-full atmosphere-top-right" />
      </div>

      {/* Sidebar */}
      <Sidebar
        currentStep={project.currentStep}
        furthestStep={project.furthestStep}
        onStepClick={project.setCurrentStep}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col z-10 text-ink">
        {/* Hidden file input for asset uploads */}
        <input
          type="file"
          ref={project.fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={project.onFileSelected}
        />

        {/* Top Navigation Bar */}
        <Navbar
          activeProject={project.activeProject}
          onSwitchProject={() => project.setIsProjectModalOpen(true)}
        />

        {/* Step Content */}
        <section
          key={`${project.activeProjectId}-${project.currentStep}`}
          className="flex-1 px-12 py-12 lg:px-24 relative overflow-y-auto scrollbar-none"
        >
          <AnimatePresence mode="wait">
            {project.currentStep === 1 && (
              <StepConcept
                key="step-1"
                concept={project.concept}
                setConcept={project.setConcept}
                scenes={project.scenes}
                isGenerating={ai.isGenerating}
                furthestStep={project.furthestStep}
                onGenerate={ai.handleGenerateInitialScript}
                onResume={() => project.setCurrentStep(2)}
                onStepClick={project.setCurrentStep}
              />
            )}

            {project.currentStep === 2 && (
              <StepScripting
                key="step-2"
                scenes={project.scenes}
                isAddingScenes={ai.isAddingScenes}
                scenesCountInput={ai.scenesCountInput}
                setScenesCountInput={ai.setScenesCountInput}
                onAddScenesAI={ai.handleAddScenesAI}
                onNextStep={() => project.setCurrentStep(3)}
              />
            )}

            {project.currentStep === 3 && (
              <StepVisuals
                key="step-3"
                scenes={project.scenes}
                setScenes={project.setScenes}
                generatingImages={ai.generatingImages}
                isGeneratingAllImages={ai.isGeneratingAllImages}
                copyStatus={ai.copyStatus}
                onGenerateImage={ai.handleGenerateImage}
                onGenerateAllImages={ai.handleGenerateAllImages}
                onCopyPrompt={ai.handleCopyPrompt}
                onUploadAsset={project.handleUploadAsset}
                onDownloadAsset={project.handleDownloadAsset}
                onNextStep={() => project.setCurrentStep(4)}
              />
            )}

            {project.currentStep === 4 && (
              <StepAnimation
                key="step-4"
                scenes={project.scenes}
                setScenes={project.setScenes}
                generatingAnimations={ai.generatingAnimations}
                isGeneratingAllAnimations={ai.isGeneratingAllAnimations}
                onGenerateAnimationPrompt={ai.handleGenerateAnimationPrompt}
                onGenerateAllAnimationPrompts={ai.handleGenerateAllAnimationPrompts}
                onUploadAsset={project.handleUploadAsset}
                onDownloadAsset={project.handleDownloadAsset}
                onNextStep={() => project.setCurrentStep(5)}
              />
            )}

            {project.currentStep === 5 && (
              <StepVoiceover
                key="step-5"
                scenes={project.scenes}
                setScenes={project.setScenes}
                generatingVoiceovers={ai.generatingVoiceovers}
                synthesizingVoiceovers={ai.synthesizingVoiceovers}
                isGeneratingAllVoiceovers={ai.isGeneratingAllVoiceovers}
                isSynthesizingAllVoiceovers={ai.isSynthesizingAllVoiceovers}
                onGenerateVoiceover={ai.handleGenerateVoiceover}
                onGenerateAllVoiceovers={ai.handleGenerateAllVoiceovers}
                onSynthesizeVoiceover={ai.handleSynthesizeVoiceover}
                onSynthesizeAllVoiceovers={ai.handleSynthesizeAllVoiceovers}
                onUploadAsset={project.handleUploadAsset}
                onDownloadAsset={project.handleDownloadAsset}
                onNextStep={() => project.setCurrentStep(6)}
              />
            )}

            {project.currentStep === 6 && (
              <StepFinalize
                key="step-6"
                scenes={project.scenes}
                videoTitle={project.videoTitle}
                setVideoTitle={project.setVideoTitle}
                videoDescription={project.videoDescription}
                setVideoDescription={project.setVideoDescription}
                isGenerating={ai.isGenerating}
                activeProjectFormat={project.activeProject?.format}
                onGenerateMetadata={ai.handleGenerateMetadata}
                onDownloadAsset={project.handleDownloadAsset}
              />
            )}

            {/* Fallback for any edge-case step */}
            {project.currentStep > 6 && (
              <motion.div
                key={`step-${project.currentStep}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex items-center justify-center h-full flex-col text-center"
              >
                <div className="w-24 h-24 rounded-full bg-teal/10 flex items-center justify-center text-teal mb-8">
                  <Sparkles className="w-12 h-12" />
                </div>
                <h2 className="text-5xl mb-4 italic">{STEPS[project.currentStep - 1]?.label}</h2>
                <p className="text-xl text-ink/40 max-w-md">
                  We're initializing the production engine for{' '}
                  {STEPS[project.currentStep - 1]?.label?.toLowerCase()}.
                </p>
                <button
                  onClick={() => project.setCurrentStep(1)}
                  className="mt-12 text-sm font-bold uppercase tracking-widest text-flame hover:tracking-[0.2em] transition-all"
                >
                  Back to Concept
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
