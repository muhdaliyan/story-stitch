/**
 * useAI — all AI calls now go through the FastAPI backend.
 * API keys (OpenAI, Gemini, ElevenLabs) live only in backend/.env.
 *
 * The Vite dev-server proxies /api/* → http://localhost:8000 so fetch('/api/...')
 * works transparently in both dev and production.
 */

import { useState } from 'react';
import type { Scene, StepId } from '../types';

interface UseAIOptions {
  concept: string;
  scenes: Scene[];
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
  setCurrentStep: React.Dispatch<React.SetStateAction<StepId>>;
  setVideoTitle: React.Dispatch<React.SetStateAction<string>>;
  setVideoDescription: React.Dispatch<React.SetStateAction<string>>;
  activeProjectSceneFrequency?: number;
  activeProjectTargetDuration?: number;
  activeProjectFormat?: 'short' | 'long';
}

// ── Small fetch helper ────────────────────────────────────────────────────────

async function api<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`[${res.status}] ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAI({
  concept,
  scenes,
  setScenes,
  setCurrentStep,
  setVideoTitle,
  setVideoDescription,
  activeProjectSceneFrequency,
  activeProjectTargetDuration,
  activeProjectFormat,
}: UseAIOptions) {
  const [isGenerating, setIsGenerating]                         = useState(false);
  const [scenesCountInput, setScenesCountInput]                 = useState('1');
  const [isAddingScenes, setIsAddingScenes]                     = useState(false);
  const [generatingImages, setGeneratingImages]                 = useState<Record<string, boolean>>({});
  const [generatingAnimations, setGeneratingAnimations]         = useState<Record<string, boolean>>({});
  const [generatingVoiceovers, setGeneratingVoiceovers]         = useState<Record<string, boolean>>({});
  const [synthesizingVoiceovers, setSynthesizingVoiceovers]     = useState<Record<string, boolean>>({});
  const [isGeneratingAllAnimations, setIsGeneratingAllAnimations] = useState(false);
  const [isGeneratingAllVoiceovers, setIsGeneratingAllVoiceovers] = useState(false);
  const [isSynthesizingAllVoiceovers, setIsSynthesizingAllVoiceovers] = useState(false);
  const [isGeneratingAllImages, setIsGeneratingAllImages]       = useState(false);
  const [copyStatus, setCopyStatus]                             = useState<Record<string, boolean>>({});

  // ── Copy prompt ─────────────────────────────────────────────────────────────

  const handleCopyPrompt = (sceneId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus({ ...copyStatus, [sceneId]: true });
    setTimeout(() => setCopyStatus(prev => ({ ...prev, [sceneId]: false })), 2000);
  };

  // ── Image (Gemini via backend) ───────────────────────────────────────────────

  const handleGenerateImage = async (sceneId: string, prompt: string) => {
    setGeneratingImages(prev => ({ ...prev, [sceneId]: true }));
    try {
      const data = await api<{ image_b64: string }>('/api/image/generate', {
        scene_id: sceneId,
        prompt,
        format: activeProjectFormat ?? 'long',
      });
      setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, imageUrl: data.image_b64 } : s));
    } catch (error) {
      console.error('Image generation failed', error);
      const msg = String(error);
      if (msg.includes('429'))
        alert('Image generation quota exceeded. Please try again in 60 seconds.');
      else
        alert('Image generation failed. AI might be under heavy load.');
    } finally {
      setGeneratingImages(prev => ({ ...prev, [sceneId]: false }));
    }
  };

  const handleGenerateAllImages = async () => {
    setIsGeneratingAllImages(true);
    try {
      await Promise.all(scenes.map(s => handleGenerateImage(s.id, s.visual)));
    } catch (error) {
      console.error('Batch image generation failed', error);
      if (String(error).includes('429'))
        alert('Batch production hit quota limits. Some images may not have generated — please retry individual scenes.');
    } finally {
      setIsGeneratingAllImages(false);
    }
  };

  // ── Animation prompts (OpenAI via backend) ───────────────────────────────────

  const handleGenerateAnimationPrompt = async (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;
    setGeneratingAnimations(prev => ({ ...prev, [sceneId]: true }));
    try {
      const data = await api<{ animation_prompt: string }>('/api/animation/prompt', {
        scene_id: sceneId,
        narrative: scene.narrative,
        visual: scene.visual,
      });
      setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, animationPrompt: data.animation_prompt } : s));
    } catch (error) {
      console.error('Animation prompt generation failed', error);
    } finally {
      setGeneratingAnimations(prev => ({ ...prev, [sceneId]: false }));
    }
  };

  const handleGenerateAllAnimationPrompts = async () => {
    setIsGeneratingAllAnimations(true);
    try {
      // Backend supports batch endpoint — use it
      const data = await api<{ results: Array<{ scene_id: string; animation_prompt: string }> }>(
        '/api/animation/prompt-all',
        {
          scenes: scenes.map(s => ({ scene_id: s.id, narrative: s.narrative, visual: s.visual })),
        }
      );
      setScenes(prev =>
        prev.map(s => {
          const found = data.results.find(r => r.scene_id === s.id);
          return found ? { ...s, animationPrompt: found.animation_prompt } : s;
        })
      );
    } catch (error) {
      console.error('Batch animation generation failed', error);
    } finally {
      setIsGeneratingAllAnimations(false);
    }
  };

  // ── Voiceover script (OpenAI via backend) ────────────────────────────────────

  const handleGenerateVoiceover = async (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;
    setGeneratingVoiceovers(prev => ({ ...prev, [sceneId]: true }));
    try {
      const data = await api<{
        script: string; voice: string;
        stability: number; similarity: number; style: number; speed: number;
      }>('/api/voiceover/script', {
        scene_id: sceneId,
        narrative: scene.narrative,
        scene_frequency: activeProjectSceneFrequency ?? 10,
      });
      setScenes(prev =>
        prev.map(s =>
          s.id === sceneId
            ? {
                ...s,
                voiceoverScript: data.script,
                voiceModel: data.voice,
                stability: data.stability,
                similarity: data.similarity,
                styleExaggeration: data.style,
                speed: data.speed,
              }
            : s
        )
      );
    } catch (error) {
      console.error('Voiceover script generation failed', error);
      if (String(error).includes('429'))
        alert('Voiceover generation quota exceeded. Please wait a moment.');
    } finally {
      setGeneratingVoiceovers(prev => ({ ...prev, [sceneId]: false }));
    }
  };

  const handleGenerateAllVoiceovers = async () => {
    setIsGeneratingAllVoiceovers(true);
    try {
      await Promise.all(scenes.map(s => handleGenerateVoiceover(s.id)));
    } catch (error) {
      console.error('Batch voiceover generation failed', error);
    } finally {
      setIsGeneratingAllVoiceovers(false);
    }
  };

  // ── Voiceover audio synthesis (ElevenLabs via backend) ───────────────────────

  const handleSynthesizeVoiceover = async (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    // If no script yet, silently skip — button is already visually disabled for this case
    if (!scene?.voiceoverScript?.trim()) return;
    setSynthesizingVoiceovers(prev => ({ ...prev, [sceneId]: true }));
    try {
      const data = await api<{ audio_b64: string }>('/api/voiceover/synthesize', {
        scene_id: sceneId,
        script: scene.voiceoverScript,
        voice: scene.voiceModel ?? 'Rachel',
        stability: scene.stability ?? 0.5,
        similarity: scene.similarity ?? 0.75,
        style: scene.styleExaggeration ?? 0.0,
        speed: scene.speed ?? 1.0,
      });
      setScenes(prev =>
        prev.map(s => s.id === sceneId ? { ...s, voiceoverAudioUrl: data.audio_b64 } : s)
      );
    } catch (error) {
      console.error('Voice synthesis failed', error);
      alert('Voice synthesis failed. Check your ElevenLabs API key and quota.');
    } finally {
      setSynthesizingVoiceovers(prev => ({ ...prev, [sceneId]: false }));
    }
  };

  const handleSynthesizeAllVoiceovers = async () => {
    // Only synthesize scenes that already have a script
    const scenesWithScript = scenes.filter(s => s.voiceoverScript?.trim());
    if (scenesWithScript.length === 0) {
      alert('Generate voiceover scripts for your scenes first, then synthesize all.');
      return;
    }
    setIsSynthesizingAllVoiceovers(true);
    try {
      await Promise.all(scenesWithScript.map(s => handleSynthesizeVoiceover(s.id)));
    } catch (error) {
      console.error('Batch synthesis failed', error);
    } finally {
      setIsSynthesizingAllVoiceovers(false);
    }
  };

  // ── Video metadata (OpenAI via backend) ──────────────────────────────────────

  const handleGenerateMetadata = async () => {
    setIsGenerating(true);
    try {
      const data = await api<{ title: string; description: string }>('/api/metadata/generate', {
        concept,
        scene_narratives: scenes.map(s => s.narrative),
      });
      setVideoTitle(data.title ?? '');
      setVideoDescription(data.description ?? '');
    } catch (error) {
      console.error('Metadata generation failed', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Initial script (OpenAI via backend) ──────────────────────────────────────

  const handleGenerateInitialScript = async () => {
    const targetDuration  = activeProjectTargetDuration  ?? 60;
    const sceneFrequency  = activeProjectSceneFrequency  ?? 10;
    const format          = activeProjectFormat          ?? 'short';
    const sceneCount      = Math.floor(targetDuration / sceneFrequency);

    setIsGenerating(true);
    try {
      const data = await api<{ scenes: Array<{ narrative: string; visual: string }> }>(
        '/api/script/generate',
        { concept, target_duration: targetDuration, scene_frequency: sceneFrequency, format }
      );

      const newScenes = data.scenes.slice(0, sceneCount).map((s, i) => ({
        id: `s-initial-${Date.now()}-${i}`,
        number: i + 1,
        narrative: s.narrative,
        visual: s.visual,
      }));
      setScenes(newScenes);
      setCurrentStep(2);
    } catch (error) {
      console.error('AI Generation failed', error);
      const msg = String(error);
      if (msg.includes('429'))
        alert('Script generation quota exceeded. Please wait a moment before trying again.');
      else
        alert(`Script generation failed: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Add scenes (OpenAI via backend) ──────────────────────────────────────────

  const handleAddScenesAI = async () => {
    const count = parseInt(scenesCountInput) || 1;
    setIsAddingScenes(true);
    try {
      const data = await api<{ scenes: Array<{ narrative: string; visual: string }> }>(
        '/api/script/add-scenes',
        {
          concept,
          existing_scenes: scenes.map(s => ({ narrative: s.narrative, visual: s.visual })),
          count,
        }
      );

      const newScenes = data.scenes.map((s, i) => ({
        id: `s-ai-${Date.now()}-${i}`,
        number: scenes.length + i + 1,
        narrative: s.narrative,
        visual: s.visual,
      }));
      setScenes([...scenes, ...newScenes]);
      setScenesCountInput('1');
    } catch (error) {
      console.error('Scene addition failed', error);
    } finally {
      setIsAddingScenes(false);
    }
  };

  // ── Public API ────────────────────────────────────────────────────────────────

  return {
    isGenerating,
    scenesCountInput,
    setScenesCountInput,
    isAddingScenes,
    generatingImages,
    generatingAnimations,
    generatingVoiceovers,
    synthesizingVoiceovers,
    isGeneratingAllAnimations,
    isGeneratingAllVoiceovers,
    isSynthesizingAllVoiceovers,
    isGeneratingAllImages,
    copyStatus,
    handleCopyPrompt,
    handleGenerateImage,
    handleGenerateAllImages,
    handleGenerateAnimationPrompt,
    handleGenerateAllAnimationPrompts,
    handleGenerateVoiceover,
    handleGenerateAllVoiceovers,
    handleSynthesizeVoiceover,
    handleSynthesizeAllVoiceovers,
    handleGenerateMetadata,
    handleGenerateInitialScript,
    handleAddScenesAI,
  };
}
