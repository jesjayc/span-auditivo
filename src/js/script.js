const TRIAL_DIRECT_SEQUENCES = [
    { span: 2, sequences: [{ sequence: [8, 3], correct: [8, 3] }, { sequence: [5, 9], correct: [5, 9] }] }
];

const TRIAL_INVERSE_SEQUENCES = [
    { span: 2, sequences: [{ sequence: [4, 9], correct: [9, 4] }, { sequence: [5, 2], correct: [2, 5] }] }
];

const DIRECT_SEQUENCES = [
  { span: 2, sequences: [{ sequence: [3, 8], correct: [3, 8] }, { sequence: [5, 1], correct: [5, 1] }] },
  { span: 3, sequences: [{ sequence: [6, 2, 9], correct: [6, 2, 9] }, { sequence: [4, 7, 1], correct: [4, 7, 1] }] },
  { span: 4, sequences: [{ sequence: [1, 5, 4, 7], correct: [1, 5, 4, 7] }, { sequence: [8, 2, 3, 6], correct: [8, 2, 3, 6] }] },
  { span: 5, sequences: [{ sequence: [9, 3, 1, 4, 8], correct: [9, 3, 1, 4, 8] }, { sequence: [7, 2, 5, 1, 6], correct: [7, 2, 5, 1, 6] }] },
  { span: 6, sequences: [{ sequence: [2, 6, 8, 5, 9, 1], correct: [2, 6, 8, 5, 9, 1] }, { sequence: [4, 8, 3, 7, 1, 2], correct: [4, 8, 3, 7, 1, 2] }] },
  { span: 7, sequences: [{ sequence: [5, 9, 2, 7, 6, 3, 4], correct: [5, 9, 2, 7, 6, 3, 4] }, { sequence: [1, 6, 8, 3, 5, 9, 7], correct: [1, 6, 8, 3, 5, 9, 7] }] },
  { span: 8, sequences: [{ sequence: [6, 4, 8, 1, 3, 7, 2, 5], correct: [6, 4, 8, 1, 3, 7, 2, 5] }, { sequence: [3, 9, 8, 2, 4, 6, 7, 1], correct: [3, 9, 8, 2, 4, 6, 7, 1] }] },
  { span: 9, sequences: [{ sequence: [7, 1, 5, 6, 3, 8, 2, 9, 4], correct: [7, 1, 5, 6, 3, 8, 2, 9, 4] }, { sequence: [6, 2, 9, 4, 1, 7, 8, 5, 3], correct: [6, 2, 9, 4, 1, 7, 8, 5, 3] }] },
];

const INVERSE_SEQUENCES = [
  { span: 2, sequences: [{ sequence: [5, 2], correct: [2, 5] }, { sequence: [9, 1], correct: [1, 9] }] },
  { span: 3, sequences: [{ sequence: [7, 2, 3], correct: [3, 2, 7] }, { sequence: [4, 8, 6], correct: [6, 8, 4] }] },
  { span: 4, sequences: [{ sequence: [1, 9, 2, 5], correct: [5, 2, 9, 1] }, { sequence: [3, 6, 4, 7], correct: [7, 4, 6, 3] }] },
  { span: 5, sequences: [{ sequence: [8, 4, 1, 5, 7], correct: [7, 5, 1, 4, 8] }, { sequence: [2, 5, 9, 3, 6], correct: [6, 3, 9, 5, 2] }] },
  { span: 6, sequences: [{ sequence: [9, 7, 3, 8, 2, 1], correct: [1, 2, 8, 3, 7, 9] }, { sequence: [5, 4, 9, 6, 1, 3], correct: [3, 1, 6, 9, 4, 5] }] },
  { span: 7, sequences: [{ sequence: [6, 1, 8, 5, 2, 7, 4], correct: [4, 7, 2, 5, 8, 1, 6] }, { sequence: [9, 5, 3, 1, 4, 8, 2], correct: [2, 8, 4, 1, 3, 5, 9] }] },
  { span: 8, sequences: [{ sequence: [3, 7, 4, 9, 5, 2, 6, 1], correct: [1, 6, 2, 5, 9, 4, 7, 3] }, { sequence: [8, 2, 4, 1, 6, 3, 9, 7], correct: [7, 9, 3, 6, 1, 4, 2, 8] }] },
  { span: 9, sequences: [{ sequence: [1, 5, 8, 3, 9, 7, 2, 4, 6], correct: [6, 4, 2, 7, 9, 3, 8, 5, 1] }, { sequence: [9, 4, 7, 1, 6, 2, 5, 8, 3], correct: [3, 8, 5, 2, 6, 1, 7, 4, 9] }] },
];

const ICONS = {
    CHECK: '✅',
    X: '❌',
    SPEAKER: '🔊'
};

// --- AUDIO PLAYER ---
async function playSequence(sequence, onSequenceEnd) {
    try {
        const audioElements = sequence.map(digit => new Audio(`src/audio/${digit}.mp3`));
        
        for (const audio of audioElements) {
            await new Promise(resolve => {
                audio.onended = resolve;
                audio.play().catch(err => {
                    console.error(`Error playing audio ${audio.src}:`, err);
                    resolve();
                });
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (error) {
        console.error("Failed to play audio sequence:", error);
    } finally {
        if (onSequenceEnd) onSequenceEnd();
    }
}


// --- APP LOGIC ---
document.addEventListener('DOMContentLoaded', () => {

    let state = {
        gamePhase: 'welcome',
        results: { direct: [], inverse: [] },
        currentTest: {
            stage: null,
            sequences: [],
            pairIndex: 0,
            trialIndex: 0,
            errorsInPair: 0,
            userInput: [],
            lastTyped: null,
        },
        audioTest: {
            attempts: 0,
            userInput: '',
            isPlaying: false,
            feedback: '',
            showError: false
        }
    };
    
    const resetState = () => {
        state = {
            gamePhase: 'direct_trial_instructions',
            results: { direct: [], inverse: [] },
            currentTest: { stage: null, sequences: [], pairIndex: 0, trialIndex: 0, errorsInPair: 0, userInput: [], lastTyped: null },
            audioTest: { attempts: 0, userInput: '', isPlaying: false, feedback: '', showError: false }
        };
        setupInstructions('direct_trial');
        showScreen('screen-instructions');
    };

    const screens = document.querySelectorAll('.screen');
    
    const showScreen = (screenId) => {
        screens.forEach(s => s.hidden = true);
        const activeScreen = document.getElementById(screenId);
        if (activeScreen) {
            activeScreen.hidden = false;
        }
    };

    // --- Audio Test Screen ---
    const audioTestContent = document.getElementById('audio-test-content');
    const btnPlayAudio = document.getElementById('btn-play-audio');
    const playAudioText = document.getElementById('play-audio-text');
    const audioTestInputDisplay = document.getElementById('audio-test-input-display');
    const btnCheckAudio = document.getElementById('btn-check-audio');
    const audioTestFeedback = document.getElementById('audio-test-feedback');
    const btnStartTest = document.getElementById('btn-start-test');
    const btnReloadPage = document.getElementById('btn-reload-page');

    const initAudioTest = () => {
        state.audioTest = { 
            attempts: 0, 
            userInput: '', 
            isPlaying: false, 
            feedback: '', 
            showError: false,
            played: false // TRAVA METODOLÓGICA (CADEADO) INSERIDA AQUI
        };
        updateAudioTestUI();
    };

    const updateAudioTestUI = () => {
        audioTestInputDisplay.textContent = state.audioTest.userInput;  
        
        // Comportamento Padronizado: Botão travado enquanto toca
        btnPlayAudio.disabled = state.audioTest.isPlaying;
        playAudioText.innerHTML = state.audioTest.isPlaying ? '⏳ REPRODUZINDO...' : '▶ REPRODUZIR ÁUDIO';
        
        // A checagem agora exige que o input não seja vazio e NÃO esteja tocando
        btnCheckAudio.disabled = state.audioTest.isPlaying || state.audioTest.userInput.length === 0;

        audioTestFeedback.textContent = state.audioTest.feedback;
        audioTestFeedback.className = 'feedback';
        
        if (state.audioTest.feedback === 'Perfeito! Áudio validado.') {
            audioTestFeedback.classList.add('correct');
            btnStartTest.hidden = false;
            audioTestContent.hidden = true;
        } else if (state.audioTest.feedback) {
            audioTestFeedback.classList.add('incorrect');
        }

        if(state.audioTest.showError) {
            audioTestContent.hidden = true;
            btnReloadPage.hidden = false;
        } else {
             audioTestContent.hidden = false;
            btnReloadPage.hidden = true;
        }
    };

    btnPlayAudio.addEventListener('click', () => {
        state.audioTest.isPlaying = true;
        state.audioTest.feedback = '';
        updateAudioTestUI();
        
        playSequence([1, 5, 7], () => {
            state.audioTest.isPlaying = false;
            state.audioTest.played = true; // ABRE O CADEADO AO FINAL
            updateAudioTestUI();
            
            // Revalidador automático: checa se ele já digitou a resposta certa durante o áudio
            if (state.audioTest.userInput === '157') {
                btnCheckAudio.click(); 
            }
        });
    });

    btnCheckAudio.addEventListener('click', () => {
        // Validação rigorosa: Resposta correta E áudio já finalizado
        if (state.audioTest.userInput === '157' && state.audioTest.played) {
            state.audioTest.feedback = 'Perfeito! Áudio validado.';
        } else {
            state.audioTest.attempts++;
            state.audioTest.userInput = '';
            
            // Se errou porque tentou validar ANTES do áudio terminar
            if (state.audioTest.userInput === '157' && !state.audioTest.played) {
                 state.audioTest.feedback = 'Aguarde o áudio terminar para verificar.';
                 state.audioTest.attempts--; // Não conta como tentativa errada de digitação
            } else if (state.audioTest.attempts >= 5) {
                state.audioTest.showError = true;
                state.audioTest.feedback = `Você provavelmente está com um problema em seu áudio. Por favor, contate o avaliador para obter auxílio.`;
            } else {
                state.audioTest.feedback = 'Incorreto. Tente novamente!';
            }
        }
        updateAudioTestUI();
    });

    btnStartTest.addEventListener('click', () => {
        state.gamePhase = 'direct_trial_instructions';
        setupInstructions('direct_trial');
        showScreen('screen-instructions');
    });

    btnReloadPage.addEventListener('click', () => window.location.reload());

    // --- Instructions Screen ---
    const instructionTitle = document.getElementById('instruction-title');
    const instructionContent = document.getElementById('instruction-content');
    const btnReady = document.getElementById('btn-ready');

    const setupInstructions = (type) => {
        if (type === 'direct_trial') {
            instructionTitle.textContent = "Treino - Span de Dígitos (Etapa Direta)";
            instructionContent.innerHTML = `
                <p>Nesse teste você vai ouvir uma sequência de números em áudio. Preste bastante atenção.</p>
                <p>Assim que a sequência terminar, você deverá <strong>digitar os números</strong> que ouviu no teclado do seu computador, na <strong>mesma ordem</strong> em que eles foram falados.</p>
                <p>Quando terminar de digitar, clique no botão para seguir para a próxima sequência.</p>
                <p>Se cometer um erro durante a digitação clique no botão "Refazer" e digite novamente a sequência.</p>
                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid var(--border);">
                    <h3 style="color: var(--cyan); text-align: center; margin-bottom: 15px; font-size: 1.2rem;">⚠️ IMPORTANTE</h3>
                    <p style="text-align: center; margin: 0 auto; max-width: 480px;">A sequência será reproduzida <strong>uma única vez</strong>.<br>A sequência <strong>não pode ser ouvida novamente</strong>.<br>Preste <strong>muita</strong> atenção!</p>
                </div>
            `;
            btnReady.onclick = () => {
                state.gamePhase = 'direct_trial_test';
                startTest('direct', true);
            };
        } else if (type === 'direct') {
            instructionTitle.textContent = "Teste Oficial - Etapa Direta";
            instructionContent.innerHTML = `
                <p>Excelente! Agora que você entendeu como o teste funciona, vamos para o teste oficial.</p>
                <p>Lembre-se da regra principal: <strong>digite os números na exata mesma ordem</strong> que os ouvir.</p>
                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid var(--border);">
                    <h3 style="color: var(--cyan); text-align: center; margin-bottom: 15px; font-size: 1.2rem;">⚠️ IMPORTANTE</h3>
                    <p style="text-align: center; margin: 0 auto; max-width: 480px;">A sequência será reproduzida <strong>uma única vez</strong>.<br>A sequência <strong>não pode ser ouvida novamente</strong>.<br>Preste <strong>muita</strong> atenção!</p>
                </div>
            `;
            btnReady.onclick = () => {
                state.gamePhase = 'direct_test';
                startTest('direct', false);
            };
        } else if (type === 'inverse_trial') {
            instructionTitle.textContent = "Treino - Span de Dígitos (Etapa Inversa)";
            instructionContent.innerHTML = `
                <p>Nessa próxima etapa de treino você vai ouvir novas sequências de números, assim como na parte anterior.</p>
                <p>No entanto, desta vez, sua tarefa será digitar os números na <strong>ordem inversa (de trás para frente)</strong> que eles foram falados.</p>
                <p>Quando terminar de digitar, clique no botão para seguir para a próxima sequência.</p>
                <p>Se cometer um erro durante a digitação clique no botão "Refazer" e digite novamente a sequência.</p>
                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid var(--border);">
                    <h3 style="color: var(--cyan); text-align: center; margin-bottom: 15px; font-size: 1.2rem;">⚠️ IMPORTANTE</h3>
                    <p style="text-align: center; margin: 0 auto; max-width: 480px;">A sequência será reproduzida <strong>uma única vez</strong>.<br>A sequência <strong>não pode ser ouvida novamente</strong>.<br>Preste <strong>muita</strong> atenção!</p>
                </div>
            `;
            btnReady.onclick = () => {
                state.gamePhase = 'inverse_trial_test';
                startTest('inverse', true);
            };
        } else if (type === 'inverse') {
            instructionTitle.textContent = "Teste Oficial - Etapa Inversa";
            instructionContent.innerHTML = `
                <p>Muito bem! Agora que você dominou a inversão, vamos iniciar o teste oficial desta etapa.</p>
                <p>Lembre-se da regra principal: digite os números na <strong>ordem inversa (de trás para frente)</strong> que eles foram falados.</p>
                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid var(--border);">
                    <h3 style="color: var(--cyan); text-align: center; margin-bottom: 15px; font-size: 1.2rem;">⚠️ IMPORTANTE</h3>
                    <p style="text-align: center; margin: 0 auto; max-width: 480px;">A sequência será reproduzida <strong>uma única vez</strong>.<br>A sequência <strong>não pode ser ouvida novamente</strong>.<br>Preste <strong>muita</strong> atenção!</p>
                </div>
            `;
            btnReady.onclick = () => {
                state.gamePhase = 'inverse_test';
                startTest('inverse', false);
            };
        }
    };
    
    // --- Test Screen ---
    const testPreparing = document.getElementById('test-preparing');
    const testPlaying = document.getElementById('test-playing');
    const testInputting = document.getElementById('test-inputting');
    const lastTypedDigit = document.getElementById('last-typed-digit');
    const btnRedo = document.getElementById('btn-redo');
    const btnNext = document.getElementById('btn-next');
    let digitTimeout = null;
    
    const startTest = (stage, isTrial = false) => {
        let sequences;
        if (isTrial) {
            sequences = stage === 'direct' ? TRIAL_DIRECT_SEQUENCES : TRIAL_INVERSE_SEQUENCES;
        } else {
            sequences = stage === 'direct' ? DIRECT_SEQUENCES : INVERSE_SEQUENCES;
        }

        state.currentTest = {
            stage,
            isTrial,
            sequences,
            pairIndex: 0,
            trialIndex: 0,
            errorsInPair: 0,
            userInput: [],
            lastTyped: null,
        };
        showScreen('screen-test');
        runTestFlow();
    };

    const runTestFlow = () => {
        const { pairIndex, trialIndex, sequences } = state.currentTest;
        const currentSequence = sequences[pairIndex]?.sequences[trialIndex];
        
        if (!currentSequence) {
            completeTestStage();
            return;
        }

        testPreparing.hidden = false;
        testPlaying.hidden = true;
        testInputting.hidden = true;
        
        setTimeout(() => {
            testPreparing.hidden = true;
            testPlaying.hidden = false;
            playSequence(currentSequence.sequence, () => {
                testPlaying.hidden = true;
                testInputting.hidden = false;
                state.gamePhase = 'inputting';
            });
        }, 2000);
    };
    
    const completeTestStage = () => {
        const { stage, isTrial } = state.currentTest;

        if (stage === 'direct' && isTrial) {
            state.gamePhase = 'direct_instructions';
            setupInstructions('direct');
            showScreen('screen-instructions');
        } else if (stage === 'direct' && !isTrial) {
            state.gamePhase = 'inverse_trial_instructions';
            setupInstructions('inverse_trial');
            showScreen('screen-instructions');
        } else if (stage === 'inverse' && isTrial) {
            state.gamePhase = 'inverse_instructions';
            setupInstructions('inverse');
            showScreen('screen-instructions');
        } else {
            state.gamePhase = 'results';
            showScreen('screen-results');
        }
    };

    btnRedo.addEventListener('click', () => {
        state.currentTest.userInput = [];
        state.currentTest.lastTyped = null;
        updateLastTypedUI();
    });

    btnNext.addEventListener('click', () => {
        const { pairIndex, trialIndex, sequences, userInput, errorsInPair, isTrial, stage } = state.currentTest;
        const currentSeqData = sequences[pairIndex].sequences[trialIndex];
        const isCorrect = JSON.stringify(userInput) === JSON.stringify(currentSeqData.correct);

        if (isTrial) {
            if (!isCorrect) {
                if (digitTimeout) clearTimeout(digitTimeout); // protege a mensagem de erro para permanecer mais tempo na tela

                lastTypedDigit.innerHTML = `
                ${ICONS.X}<br>
                    <span style="font-size: 1.2rem; color: var(--error); font-weight: normal; display: block; margin-top: 10px;">
                        Incorreto! Procure ouvir de novo, atentamente.
                    </span>
                `;
                lastTypedDigit.style.opacity = '1';

                document.querySelector('.button-group').style.visibility = 'hidden';

                setTimeout(() => {
                    lastTypedDigit.style.opacity = '0';
                    state.currentTest.lastTyped = null;
                    state.currentTest.userInput = [];
                    document.querySelector('.button-group').style.visibility = 'visible';
                    runTestFlow();
                }, 2000);

                return;
            }
        }
        else {
            const newResult = {
                span: sequences[pairIndex].span,
                sequence: currentSeqData.sequence,
                userAnswer: userInput,
                isCorrect,
            };
            state.results[state.currentTest.stage].push(newResult);
        }

        const currentErrors = isTrial ? 0 : (errorsInPair + (isCorrect ? 0 : 1));

        let shouldStop = false;
        if (isTrial) {
            shouldStop = (pairIndex >= sequences.length - 1 && trialIndex === 1);
        } else {
            shouldStop = currentErrors >= 2 || (pairIndex >= sequences.length - 1 && trialIndex === 1);
        }

        if (shouldStop) {
            completeTestStage();
            return;
        }
        
        if (trialIndex === 1) {
            state.currentTest.pairIndex++;
            state.currentTest.trialIndex = 0;
            state.currentTest.errorsInPair = 0;
        } else {
            state.currentTest.trialIndex = 1;
            state.currentTest.errorsInPair = currentErrors;
        }
        
        state.currentTest.userInput = [];
        state.currentTest.lastTyped = null;
        updateLastTypedUI();
        runTestFlow();
    });

    const updateLastTypedUI = () => {
        const digit = state.currentTest.lastTyped;
        
        // Mata o cronômetro fantasma anterior antes de criar um novo!
        if (digitTimeout) clearTimeout(digitTimeout); 

        if (digit !== null) {
            lastTypedDigit.textContent = digit;
            lastTypedDigit.style.opacity = '1';
            digitTimeout = setTimeout(() => {
                lastTypedDigit.style.opacity = '0';
                state.currentTest.lastTyped = null;
            }, 1000);
        } else {
            lastTypedDigit.textContent = '';
            lastTypedDigit.style.opacity = '0';
        }
    };
    
    // --- Results Screen ---
    const downloadCSV = () => {
        const fields = ['etapa', 'span', 'sequencia_apresentada', 'resposta_usuario', 'acertou'];
        const buildRows = (stage, list) => list.map(r => [
            stage,
            r.span,
            `"${r.sequence.join(' ')}"`,
            `"${r.userAnswer.join(' ')}"`,
            r.isCorrect ? 'sim' : 'nao'
        ]);
        const rows = [
            ...buildRows('direta', state.results.direct),
            ...buildRows('inversa', state.results.inverse)
        ];
        const headerRow = ['campo', ...rows.map((_, i) => i + 1)];
        const fieldRows = fields.map((field, fi) => [field, ...rows.map(row => row[fi])]);
        const csv = [headerRow, ...fieldRows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resultados-span-auditivo-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    document.getElementById('btn-download-csv').addEventListener('click', downloadCSV);
    document.getElementById('btn-restart').addEventListener('click', resetState);

    // --- Global Keyboard Listener ---
    window.addEventListener('keydown', (e) => {
        
        // --- NOVA LÓGICA: Suporte para a Barra de Espaço ---
        if (e.code === 'Space') {
            e.preventDefault(); // Evita que a página role para baixo acidentalmente

            if (state.gamePhase === 'audio_test') {
                const btnStart = document.getElementById('btn-start-test');
                // Só clica se o botão "Tudo Certo" estiver visível
                if (btnStart && !btnStart.hidden) btnStart.click(); 
            } 
            else if (state.gamePhase.includes('instructions')) {
                const btnReady = document.getElementById('btn-ready');
                if (btnReady) btnReady.click();
            }
            else if (state.gamePhase === 'inputting') {
                const btnNext = document.getElementById('btn-next');
                const testInputting = document.getElementById('test-inputting');
                // Permite usar o espaço como alternativa ao botão "Próximo"
                if (btnNext && testInputting && !testInputting.hidden) {
                    btnNext.click();
                }
            }
            
            return; // Interrompe o código aqui para não cair na lógica de números abaixo
        }

        // --- LÓGICA ORIGINAL DE NÚMEROS E BACKSPACE ---
        if (!e.key.match(/^[0-9]$/) && e.key !== 'Backspace') return;
        
        if (state.gamePhase === 'audio_test' && !state.audioTest.isPlaying && !state.audioTest.showError && state.audioTest.feedback !== 'Correto!') {
            if (e.key >= '0' && e.key <= '9') {
                state.audioTest.userInput += e.key;
            } else if (e.key === 'Backspace') {
                state.audioTest.userInput = state.audioTest.userInput.slice(0, -1);
            }
            updateAudioTestUI();
        } else if (state.gamePhase === 'inputting') {
            if (e.key >= '0' && e.key <= '9') {
                const digit = parseInt(e.key, 10);
                state.currentTest.userInput.push(digit);
                state.currentTest.lastTyped = digit;
                updateLastTypedUI();
            }
        }
    });

    // --- Initial Load ---
    state.gamePhase = 'audio_test';
    initAudioTest();
    showScreen('screen-audio-test');
});