import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import styles from './HRChatbot.module.css';

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const HRChatbot = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, role: 'assistant', content: 'Hello! I\'m your HR Assistant. I can help you with:\n\n• Leave policies and requests\n• Benefits information\n• Company policies\n• HR procedures\n• General questions\n\nHow can I assist you today?', timestamp: new Date() },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const generateResponse = (userMessage: string): string => {
        const lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.includes('leave') || lowerMessage.includes('vacation') || lowerMessage.includes('pto')) {
            return 'Regarding leave policies:\n\n• **Annual Leave**: 20 days per year\n• **Sick Leave**: 10 days per year\n• **Casual Leave**: 5 days per year\n\nTo request leave, go to the Leave section in the dashboard. Your manager will be notified automatically.';
        }

        if (lowerMessage.includes('salary') || lowerMessage.includes('pay') || lowerMessage.includes('payroll')) {
            return 'Salary information is confidential. You can view your pay stubs in the Payroll section.\n\nSalary is processed on the last working day of each month. For any payroll queries, please contact hr@company.com.';
        }

        if (lowerMessage.includes('benefits') || lowerMessage.includes('insurance') || lowerMessage.includes('health')) {
            return 'Our benefits package includes:\n\n• **Health Insurance**: Comprehensive coverage for you and dependents\n• **Dental & Vision**: Full coverage\n• **401(k)**: Company matches up to 4%\n• **Life Insurance**: 2x annual salary\n• **Wellness Program**: Gym membership subsidy';
        }

        if (lowerMessage.includes('work from home') || lowerMessage.includes('remote') || lowerMessage.includes('wfh')) {
            return 'Our hybrid work policy allows:\n\n• 2 days remote work per week\n• Core hours: 10 AM - 4 PM\n• Full remote possible with manager approval\n\nPlease discuss your specific needs with your manager.';
        }

        return 'I understand you\'re asking about "' + userMessage + '". Let me help you with that.\n\nFor specific queries, you can:\n• Check the company handbook in the Resources section\n• Contact HR directly at hr@company.com\n• Schedule a meeting with your HR representative\n\nIs there anything specific I can clarify?';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Simulate AI response delay
        setTimeout(() => {
            const response: Message = {
                id: Date.now(),
                role: 'assistant',
                content: generateResponse(userMessage.content),
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, response]);
            setIsLoading(false);
        }, 1000);
    };

    const quickQuestions = [
        'What is the leave policy?',
        'How do I request time off?',
        'What are my benefits?',
        'Remote work policy?',
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerIcon}>
                    <Bot size={24} />
                </div>
                <div>
                    <h1>HR Chatbot</h1>
                    <p>Your AI-powered HR assistant</p>
                </div>
            </div>

            <div className={styles.chatContainer}>
                <div className={styles.messages}>
                    {messages.map((message) => (
                        <div key={message.id} className={`${styles.message} ${styles[message.role]}`}>
                            <div className={styles.messageAvatar}>
                                {message.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                            </div>
                            <div className={styles.messageContent}>
                                <pre className={styles.messageText}>{message.content}</pre>
                                <span className={styles.messageTime}>
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className={`${styles.message} ${styles.assistant}`}>
                            <div className={styles.messageAvatar}>
                                <Bot size={20} />
                            </div>
                            <div className={styles.messageContent}>
                                <div className={styles.typing}>
                                    <Loader2 size={16} className={styles.spinner} />
                                    <span>Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className={styles.quickQuestions}>
                    {quickQuestions.map((q, i) => (
                        <button key={i} onClick={() => setInput(q)} className={styles.quickBtn}>
                            {q}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className={styles.inputForm}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything about HR..."
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()}>
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default HRChatbot;
