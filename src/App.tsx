import { useState, useEffect, FormEvent } from 'react';
import Papa from 'papaparse';
import { Search, User, FileText, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Transaction {
  "Documento": string;
  "Estabelecimento": string;
  "Nome Cliente": string;
  "E-mail Cliente": string;
  "Código da Transação": string;
  "Data da Transação": string;
  "Data prevista de liberação": string;
  "Bandeira": string;
  "Forma de Pagamento": string;
  "Parcela": string;
  "Valor Bruto": string;
  "Valor Taxa": string;
  "Valor Líquido": string;
  "Status": string;
  "Número do Cartão": string;
  "Código NSU": string;
  "Código de Autorização": string;
  "Identificação da Maquininha": string;
  "Código da Venda": string;
  "Código Referência": string;
  "Nome Comprador": string;
  "E-mail Comprador": string;
  "Código TX ID (PIX)": string;
  "ID Split": string;
}

export default function App() {
  const [data, setData] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch from our own backend proxy
      // Add timestamp to prevent browser caching
      const response = await fetch(`/api/csv?t=${new Date().getTime()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV file: ${response.status} ${response.statusText}`);
      }
      
      // Read the entire text, not just the first chunk
      const csv = await response.text();

      Papa.parse<Transaction>(csv, {
        header: true,
        delimiter: ';',
        skipEmptyLines: true,
        complete: (results) => {
          console.log(`Loaded ${results.data.length} rows`);
          setData(results.data);
          setLastUpdated(new Date());
          setLoading(false);
          // Re-run search if there is a search term
          if (searchTerm.trim()) {
             const term = searchTerm.toLowerCase().trim();
             const newResults = results.data.filter(item => 
               item["E-mail Comprador"]?.toLowerCase().includes(term)
             );
             setSearchResults(newResults);
          }
        },
        error: (err: Error) => {
          setError(`CSV Parsing Error: ${err.message}`);
          setLoading(false);
        }
      });
    } catch (err) {
      setError(
        err instanceof Error 
          ? `${err.message}.` 
          : 'An unknown error occurred'
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setHasSearched(true);
    const term = searchTerm.toLowerCase().trim();
    const results = data.filter(item => 
      item["E-mail Comprador"]?.toLowerCase().includes(term)
    );
    setSearchResults(results);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Busca de Comprador
          </h1>
          <p className="text-slate-600 text-lg mb-4">
            Digite o e-mail para localizar o código de referência e o nome do comprador.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <span>Dados carregados: {lastUpdated ? lastUpdated.toLocaleTimeString() : '...'}</span>
            <button 
              onClick={fetchData}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline disabled:opacity-50"
            >
              {loading ? 'Atualizando...' : 'Atualizar agora'}
            </button>
          </div>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o e-mail do comprador..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-slate-200 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchTerm.trim()}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-8 border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {hasSearched && (
            <motion.div
              key={searchTerm}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 ml-1">
                    Resultados Encontrados ({searchResults.length})
                  </h2>
                  {searchResults.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                              Código Referência
                            </p>
                            <p className="text-lg font-mono font-medium text-slate-900 break-all">
                              {result["Código Referência"] || "N/A"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                              Nome Comprador
                            </p>
                            <p className="text-lg font-medium text-slate-900">
                              {result["Nome Comprador"] || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500">
                        <span className="font-medium text-slate-700">E-mail:</span>
                        {result["E-mail Comprador"]}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhum resultado encontrado</h3>
                  <p className="text-slate-500">
                    Não encontramos nenhuma transação para o e-mail "{searchTerm}"
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
