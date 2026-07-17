import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db, googleProvider } from './firebase'
import './styles.css'

const focusItems = [
  {
    number: '01',
    title: '사각지대의 패턴을 포착',
    copy: '흩어진 단서와 반복되는 신호를 모아 사건의 흐름을 읽고, 먼저 분류한 뒤 다음 행동의 기준을 세웁니다.',
  },
  {
    number: '02',
    title: '규칙 체계와 리듬 조정',
    copy: '기존 질서의 지연과 빈틈을 분석해 작은 결정이 전체 흐름에 어떤 변화를 만드는지 관찰합니다.',
  },
  {
    number: '03',
    title: '노트 규칙의 최적화',
    copy: '조건과 제약을 끝까지 읽고, 고요한 속도 안에서 가설과 규칙을 검증하는 작업을 이어갑니다.',
  },
]

const styleItems = [
  ['결과에 가까운 관찰주의', '감정에 휘둘리지 않고 상황을 차분히 읽으며, 작은 오차까지 기록합니다.'],
  ['차가운 사고와 통제', '충동보다 판단을 앞세우고, 사람과 환경을 체스판처럼 정교하게 배치합니다.'],
  ['극한의 메타 스케치', '일상과 프로젝트를 분리하지 않고, 각자의 리듬 속에서 새로운 질서를 설계합니다.'],
]

const diseaseRecordsRef = collection(db, 'diseaseRecords')

const scanLines = [
  { top: 22, length: 26, speed: '7.2s', delay: '-.8s' },
  { top: 37, length: 44, speed: '10.5s', delay: '-5.6s' },
  { top: 54, length: 18, speed: '8.7s', delay: '-2.9s' },
  { top: 69, length: 36, speed: '12.1s', delay: '-8.4s' },
  { top: 82, length: 28, speed: '9.4s', delay: '-4.1s' },
]

const studyScript = `double sigma = 0.0;
for (int i = 1; i <= 4096; ++i) {
  sigma += pow(-1, i) * sqrt(i * 3.14159);
}
auto verdict = matrix.inverse() * eigenvector;
if (verdict.norm() > 40.0) {
  solve("x^2 + 7x + 12 = 0");
}`

function playCrunch() {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return null

  const audioContext = new AudioContext()
  const crunch = () => {
    const bufferSize = audioContext.sampleRate * 0.18
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
    const output = buffer.getChannelData(0)

    for (let index = 0; index < bufferSize; index += 1) {
      output[index] = (Math.random() * 2 - 1) * Math.exp(-index / (audioContext.sampleRate * 0.055))
    }

    const noise = audioContext.createBufferSource()
    const filter = audioContext.createBiquadFilter()
    const gain = audioContext.createGain()

    noise.buffer = buffer
    filter.type = 'highpass'
    filter.frequency.value = 950
    gain.gain.value = 0.16

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(audioContext.destination)
    noise.start()
  }

  crunch()
  const intervalId = window.setInterval(crunch, 5200)

  return () => {
    window.clearInterval(intervalId)
    audioContext.close()
  }
}

function MultitaskMode({ onClose }) {
  const [typedText, setTypedText] = useState('')

  useEffect(() => {
    let index = 0
    const script = `${studyScript}\n\n// 오른손은 계산 중...\n`
    const typingId = window.setInterval(() => {
      index = (index + 1) % script.length
      setTypedText(script.slice(0, index))
    }, 38)
    const stopCrunch = playCrunch()

    return () => {
      window.clearInterval(typingId)
      if (stopCrunch) stopCrunch()
    }
  }, [])

  return (
    <div className="multitask-overlay" role="dialog" aria-modal="true" aria-labelledby="multitask-title">
      <div className="multitask-bar">
        <div>
          <p>"감자칩을 먹으면서..."</p>
          <h2 id="multitask-title">멀티태스킹 모드</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="멀티태스킹 모드 닫기">닫기</button>
      </div>
      <div className="split-screen">
        <section className="study-panel" aria-label="자동 학습 화면">
          <span>PUBLIC STUDY FEED</span>
          <pre>{typedText}<i aria-hidden="true" /></pre>
        </section>
        <section className="secret-panel" aria-label="비밀 노트">
          <span>PRIVATE NOTE</span>
          <textarea autoFocus placeholder="왼손으로는 몰래 이름을 적는다..." />
        </section>
      </div>
    </div>
  )
}

function CauseCountdown({ onClose }) {
  const [secondsLeft, setSecondsLeft] = useState(40)
  const [cause, setCause] = useState('')
  const [isFinalized, setIsFinalized] = useState(false)
  const finalCause = cause.trim() || '심장마비(Heart Attack)'

  useEffect(() => {
    if (isFinalized) return undefined

    const timerId = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timerId)
          setIsFinalized(true)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [isFinalized])

  const handleFinalize = () => {
    setSecondsLeft(0)
    setIsFinalized(true)
  }

  return (
    <div className="cause-overlay" role="dialog" aria-modal="true" aria-labelledby="cause-title">
      <div className="cause-card">
        <span className="cause-label">CAUSE OF DEATH</span>
        <h2 id="cause-title">{isFinalized ? '작업이 확정되었습니다.' : '40초 후에 이 작업이 확정됩니다.'}</h2>
        <div className="death-clock" aria-label={`남은 시간 ${secondsLeft}초`}>
          <strong>{String(secondsLeft).padStart(2, '0')}</strong>
          <span>seconds</span>
        </div>
        <label>
          사인
          <input
            value={cause}
            onChange={(event) => setCause(event.target.value)}
            disabled={isFinalized}
            placeholder="예: 서버 오류로 인한 정상 종료"
          />
        </label>
        <p>{isFinalized ? `최종 사인: ${finalCause}` : '시간 안에 사인을 수정하지 않으면 기본값으로 처리됩니다.'}</p>
        <div className="cause-actions">
          {!isFinalized && <button type="button" onClick={handleFinalize}>지금 확정</button>}
          <button type="button" onClick={onClose}>{isFinalized ? '닫기' : '취소'}</button>
        </div>
      </div>
    </div>
  )
}

function SignalField() {
  return (
    <div className="signal-field" aria-hidden="true">
      {Array.from({ length: 36 }, (_, index) => (
        <i key={index} style={{ '--i': index }} />
      ))}
      {scanLines.map((line, index) => (
        <span
          className="scan"
          key={`scan-${index}`}
          style={{
            '--scan-top': `${line.top}%`,
            '--scan-length': `${line.length}%`,
            '--scan-speed': line.speed,
            '--scan-delay': line.delay,
          }}
        />
      ))}
    </div>
  )
}

function DiseaseRegistry() {
  const [records, setRecords] = useState([])
  const [adminUser, setAdminUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState('대기')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [showCauseCountdown, setShowCauseCountdown] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setAdminUser(user)
      setIsCheckingAdmin(true)

      if (!user) {
        setIsAdmin(false)
        setIsCheckingAdmin(false)
        return
      }

      try {
        const adminSnapshot = await getDoc(doc(db, 'admins', user.uid))
        setIsAdmin(adminSnapshot.exists())
      } catch {
        setIsAdmin(false)
        setError('관리자 권한을 확인하지 못했습니다.')
      } finally {
        setIsCheckingAdmin(false)
      }
    })
  }, [])

  useEffect(() => {
    const recordsQuery = query(diseaseRecordsRef, orderBy('createdAt', 'desc'))

    return onSnapshot(
      recordsQuery,
      (snapshot) => {
        setRecords(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
        setError('')
      },
      () => {
        setError('Firestore에서 병명록을 불러오지 못했습니다.')
      },
    )
  }, [])

  const handleAdminLogin = async () => {
    setError('')

    try {
      await signInWithPopup(auth, googleProvider)
    } catch {
      setError('Google 로그인에 실패했습니다.')
    }
  }

  const handleAdminLogout = async () => {
    setError('')

    try {
      await signOut(auth)
    } catch {
      setError('로그아웃에 실패했습니다.')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedName = name.trim()
    const trimmedNote = note.trim()

    if (!trimmedName) {
      setError('병명을 입력하세요.')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      await addDoc(diseaseRecordsRef, {
        name: trimmedName,
        note: trimmedNote,
        status,
        createdAt: serverTimestamp(),
      })
      setName('')
      setNote('')
      setStatus('대기')
      setShowCauseCountdown(true)
    } catch {
      setError('병명록 저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!isAdmin) {
      setError('관리자만 삭제할 수 있습니다.')
      return
    }

    try {
      await deleteDoc(doc(db, 'diseaseRecords', id))
    } catch {
      setError('기록 삭제에 실패했습니다.')
    }
  }

  return (
    <section className="registry section shell" id="registry" aria-labelledby="registry-title">
      {showCauseCountdown && <CauseCountdown onClose={() => setShowCauseCountdown(false)} />}
      <div className="section-label">05 / FIRESTORE REGISTRY</div>
      <div className="registry-layout">
        <div>
          <h2 id="registry-title">병명록</h2>
          <p className="registry-intro">입력한 병명은 Firestore의 diseaseRecords 컬렉션에 실시간으로 저장됩니다.</p>
          <div className="admin-panel">
            {adminUser ? (
              <>
                <div>
                  <strong>{isAdmin ? '관리자 접속 중' : '관리자 권한 없음'}</strong>
                  <span>{adminUser.email}</span>
                  {!isAdmin && !isCheckingAdmin && <small>Firebase Firestore의 admins/{adminUser.uid} 문서를 추가하면 삭제 권한이 활성화됩니다.</small>}
                </div>
                <button type="button" onClick={handleAdminLogout}>로그아웃</button>
              </>
            ) : (
              <>
                <div>
                  <strong>관리자 로그인</strong>
                  <span>Google 계정으로 로그인하면 삭제 권한을 확인합니다.</span>
                </div>
                <button type="button" onClick={handleAdminLogin}>Google 로그인</button>
              </>
            )}
          </div>
        </div>

        <form className="registry-form" onSubmit={handleSubmit}>
          <label>
            병명
            <input value={name} onChange={(event) => setName(event.target.value)} maxLength="60" placeholder="예: 감기" />
          </label>
          <label>
            상태
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option>대기</option>
              <option>관찰</option>
              <option>확정</option>
              <option>해결</option>
            </select>
          </label>
          <label className="registry-note">
            메모
            <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength="240" placeholder="증상, 날짜, 참고사항" />
          </label>
          <button type="submit" disabled={isSaving}>{isSaving ? '저장 중...' : '기록 저장'}</button>
          {error && <p className="registry-error" role="alert">{error}</p>}
        </form>
      </div>

      <div className="registry-list" aria-live="polite">
        {records.length === 0 ? (
          <p className="registry-empty">아직 등록된 병명이 없습니다.</p>
        ) : (
          records.map((record) => (
            <article className={isAdmin ? 'registry-item can-delete' : 'registry-item'} key={record.id}>
              <span>{record.status || '대기'}</span>
              <div>
                <h3>{record.name}</h3>
                {record.note && <p>{record.note}</p>}
              </div>
              {isAdmin && <button type="button" onClick={() => handleDelete(record.id)}>삭제</button>}
            </article>
          ))
        )}
      </div>
    </section>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [multitaskOpen, setMultitaskOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      {multitaskOpen && <MultitaskMode onClose={() => setMultitaskOpen(false)} />}
      <a className="skip-link" href="#main">본문으로 건너뛰기</a>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="KIRA 첫 화면">KIRA<span>.</span></a>
        <button className="menu-button" type="button" aria-label="메뉴 열기" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <span /> <span />
        </button>
        <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="주요 메뉴">
          <a href="#about" onClick={closeMenu}>정의</a>
          <a href="#now" onClick={closeMenu}>현재</a>
          <a href="#rhythm" onClick={closeMenu}>리듬</a>
          <a href="#registry" onClick={closeMenu}>병명록</a>
          <a href="#contact" onClick={closeMenu}>접속</a>
        </nav>
      </header>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <SignalField />
          <div className="hero-inner shell">
            <div className="hero-copy">
              <p className="eyebrow"><span className="live-dot" /> TOKYO // PRIVATE SIGNAL</p>
              <h1 id="hero-title">KIRA</h1>
              <p className="hero-statement">법이 판단하지 못한 빈칸을 읽고, 규칙 없는 패턴에 새로운 질서를 설계하는 개인 프로토콜입니다.</p>
              <a className="primary-link" href="#registry" aria-label="병명록으로 이동">
                병명록 열기 <b aria-hidden="true">-&gt;</b>
              </a>
              <p className="microcopy">새 기록은 Firestore에 즉시 동기화됩니다.</p>
            </div>
            <div className="hero-scene" role="group" aria-label="어두운 작업실에 데이터 화면, 검은 노트, 붉은 사과, 감자칩 봉지가 놓인 장면">
              <button className="chip-trigger" type="button" onClick={() => setMultitaskOpen(true)} aria-label="감자칩 멀티태스킹 모드 열기">
                <img src="/kira-chips.png" alt="" />
              </button>
              <div className="monitor monitor-a"><span>CASE LOG</span><i /><i /><i /></div>
              <div className="monitor monitor-b"><span>OBSERVE</span><em>98.7%</em><i /><i /></div>
              <div className="desk-line" />
              <div className="notebook"><span>RULE / 01</span><span>WRITE</span></div>
              <div className="apple"><i /></div>
              <div className="chess-piece" aria-hidden="true"><span className="king-cross" /><span className="king-crown" /><span className="king-stem" /><span className="king-base" /></div>
            </div>
          </div>
          <div className="hero-footer shell"><span>ROLE / ARCHITECT OF A NEW WORLD</span><a href="#about">SCROLL TO READ <b aria-hidden="true">-&gt;</b></a></div>
        </section>

        <section className="about section shell" id="about" aria-labelledby="about-title">
          <div className="section-label">01 / DEFINITION</div>
          <div className="about-layout">
            <h2 id="about-title">정의의 기준을<br />새로 적고 있습니다.</h2>
            <div className="about-copy">
              <p>지루하고 낡아버린 질서의 모순을 바라보며, 더 정밀한 관찰과 기록으로 세계의 구조를 다시 읽습니다.</p>
              <p>침착함과 빈틈없는 논리는 흐름을 올바른 방향으로 유도하는 가장 강력한 도구입니다.</p>
              <div className="quote-line"><span>OPERATING PRINCIPLE</span><strong>정의 / 관찰 / 통제 / 기록 / 신세계</strong></div>
            </div>
          </div>
        </section>

        <section className="now section" id="now" aria-labelledby="now-title">
          <div className="shell">
            <div className="section-heading"><div className="section-label">02 / CURRENT OPERATIONS</div><h2 id="now-title">지금 가장 오래<br />들여다보는 것</h2></div>
            <div className="focus-list">
              {focusItems.map((item) => <article className="focus-item" key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}
            </div>
          </div>
        </section>

        <section className="style section shell" aria-labelledby="style-title">
          <div className="section-label">03 / METHOD</div>
          <div className="style-layout">
            <h2 id="style-title">흔들림 없이,<br />가장 정확한 순서로.</h2>
            <div className="style-list">
              {styleItems.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}
            </div>
          </div>
        </section>

        <section className="rhythm section" id="rhythm" aria-labelledby="rhythm-title">
          <div className="shell">
            <div className="section-heading"><div className="section-label">04 / DAILY FEEDBACK LOOP</div><h2 id="rhythm-title">세상을 읽고,<br />다음 수를 둡니다.</h2></div>
            <ol className="rhythm-flow">
              <li><span>01</span><h3>생각</h3><p>뉴스와 미디어를 통해 움직임을 실시간으로 관찰하고, 다음에 필요한 기준을 세웁니다.</p></li>
              <li><span>02</span><h3>메모</h3><p>감정이 아닌 구조로 정보를 기록하며, 사라지지 않는 흔적을 남깁니다.</p></li>
              <li><span>03</span><h3>피드백</h3><p>결과가 다시 화면에 반영되는 것을 확인하며, 예측과 실행의 흐름을 다듬습니다.</p></li>
            </ol>
          </div>
        </section>

        <DiseaseRegistry />

        <section className="contact section shell" id="contact" aria-labelledby="contact-title">
          <div><div className="section-label">06 / CONTACT</div><h2 id="contact-title">정의의 방향을<br />바꾸고 싶다면</h2></div>
          <div className="contact-actions">
            <a href="mailto:kira_justice@shinsegae.net">kira_justice@shinsegae.net <b aria-hidden="true">-&gt;</b></a>
            <a href="https://github.com/kira-newworld" target="_blank" rel="noreferrer">github.com/kira-newworld <b aria-hidden="true">-&gt;</b></a>
          </div>
        </section>
      </main>
      <footer className="site-footer shell"><span>KIRA / NEW WORLD PROTOCOL</span><span>ALL SIGNALS OBSERVED</span></footer>
    </>
  )
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
